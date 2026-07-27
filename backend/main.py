from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import datetime
from dotenv import load_dotenv

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from agent import check_concentration, generate_plan_agentic, edit_plan, count_course_mentions
from auth import hash_password, verify_password, create_token, decode_token, is_university_email
from database import (
    init_db,
    get_cached_plan,
    save_cached_plan,
    save_user_plan,
    update_user_plan,
    get_user_plans,
    get_user_plan_by_id,
    create_user,
    get_user_by_username,
)

load_dotenv()

# ── Rate limiter ──
limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── DB init — runs once on startup ──
init_db()

# ── Global daily generation cap ──
_daily_counter = {"date": None, "count": 0}
MAX_DAILY_GENERATIONS = 200


def check_global_daily_limit():
    today = datetime.datetime.now().date()
    if _daily_counter["date"] != today:
        _daily_counter["date"] = today
        _daily_counter["count"] = 0
    if _daily_counter["count"] >= MAX_DAILY_GENERATIONS:
        raise HTTPException(status_code=429, detail="Daily generation limit reached. Please try again tomorrow.")
    _daily_counter["count"] += 1


# ── Auth dependency ──
def get_current_user(authorization: str = Header(None)) -> str:
    """Add to any endpoint that requires login."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not logged in")
    token = authorization.replace("Bearer ", "")
    username = decode_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return username


# ── Request models ──

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    username: str
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class ConcentrationCheckRequest(BaseModel):
    college: str
    location: str = ""
    major: str


class PlanRequest(BaseModel):
    college: str
    location: str = ""
    major: str
    concentration: Optional[str] = None


class EditPlanRequest(BaseModel):
    college: str = ""
    current_plan: str
    edit_request: str


class SavePlanRequest(BaseModel):
    college: str
    location: str = ""
    major: str
    concentration: Optional[str] = None
    plan_text: str


class UpdateSavedPlanRequest(BaseModel):
    plan_id: int
    plan_text: str


# ── Auth endpoints ──

@app.post("/register")
def register(body: RegisterRequest):
    if len(body.first_name.strip()) < 1 or len(body.last_name.strip()) < 1:
        raise HTTPException(status_code=400, detail="First and last name are required")
    if len(body.username.strip()) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if body.password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if not is_university_email(body.email):
        raise HTTPException(status_code=400, detail="Must use a university (.edu) email address")

    hashed = hash_password(body.password)
    success = create_user(
        body.first_name.strip(),
        body.last_name.strip(),
        body.email.strip().lower(),
        body.username.strip(),
        hashed,
    )

    if not success:
        raise HTTPException(status_code=409, detail="Username or email already taken")

    # Auto-login after registration
    token = create_token(body.username)
    return {"status": "registered", "token": token, "username": body.username}


@app.post("/login")
def login(body: LoginRequest):
    user = get_user_by_username(body.username)

    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token(body.username)
    return {
        "token": token,
        "username": body.username,
        "first_name": user["first_name"],
    }


# ── Plan endpoints ──

@app.post("/check-concentration")
@limiter.limit("10/minute")
def concentration_check(request: Request, body: ConcentrationCheckRequest):
    if not body.college.strip() or not body.major.strip():
        raise HTTPException(status_code=400, detail="College and major are required")
    result = check_concentration(body.college, body.location, body.major)
    return result


@app.post("/generate-plan")
@limiter.limit("5/day")
def generate_plan(request: Request, body: PlanRequest):
    if not body.college.strip() or not body.major.strip():
        raise HTTPException(status_code=400, detail="College and major are required")
    if len(body.college) > 100 or len(body.major) > 100:
        raise HTTPException(status_code=400, detail="Input too long")

    # 1. Cache check — free if hit
    cached = get_cached_plan(body.college, body.location, body.major, body.concentration)
    if cached:
        print(f"✅ CACHE HIT for {body.college} / {body.major} / {body.concentration}")
        return {"status": "complete", "plan": cached, "from_cache": True}

    # 2. Global daily cap
    check_global_daily_limit()

    # 3. Generate
    print(f"❌ CACHE MISS — generating for {body.college} / {body.major} / {body.concentration}")
    result = generate_plan_agentic(body.college, body.location, body.major, body.concentration)

    # 4. Cache the result
    if result.get("status") == "complete" and "Could not complete" not in result.get("plan", ""):
        plan_to_cache = result["plan"]
        if isinstance(plan_to_cache, dict):
            import json
            plan_to_cache = json.dumps(plan_to_cache)
        save_cached_plan(body.college, body.location, body.major, body.concentration, plan_to_cache)

    result["from_cache"] = False
    return result


@app.post("/edit-plan")
@limiter.limit("3/day")
def edit_plan_endpoint(request: Request, body: EditPlanRequest):
    if not body.current_plan.strip() or not body.edit_request.strip():
        raise HTTPException(status_code=400, detail="Current plan and edit request are required")
    if count_course_mentions(body.edit_request) > 1:
        raise HTTPException(
            status_code=400,
            detail="Please request one course change at a time.",
        )
    updated = edit_plan(body.current_plan, body.edit_request, body.college)
    return {"status": "complete", "plan": updated}


# ── Save/load endpoints (require login) ──

@app.post("/save-plan")
def save_plan(body: SavePlanRequest, username: str = Depends(get_current_user)):
    plan_id = save_user_plan(
        username, body.college, body.location, body.major, body.concentration, body.plan_text
    )
    return {"status": "saved", "plan_id": plan_id}


@app.put("/save-plan")
def update_saved_plan(body: UpdateSavedPlanRequest, username: str = Depends(get_current_user)):
    update_user_plan(body.plan_id, body.plan_text)
    return {"status": "updated"}


@app.get("/saved-plans")
def list_saved_plans(username: str = Depends(get_current_user)):
    return {"plans": get_user_plans(username)}


@app.get("/saved-plans/{plan_id}")
def get_saved_plan(plan_id: int, username: str = Depends(get_current_user)):
    plan = get_user_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@app.get("/health")
def health_check():
    return {"status": "ok"}