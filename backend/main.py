from fastapi import FastAPI, HTTPException, Request
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
from database import (
    init_db,
    get_cached_plan,
    save_cached_plan,
    save_user_plan,
    update_user_plan,
    get_user_plans,
    get_user_plan_by_id,
)

load_dotenv()

# ── Rate limiter setup ──
limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB setup — runs once when the server starts ──
init_db()

# ── Global daily cap, separate from per-IP limiting ──
_daily_counter = {"date": None, "count": 0}
MAX_DAILY_GENERATIONS = 200  # tune this to your budget


def check_global_daily_limit():
    today = datetime.datetime.now().date()
    if _daily_counter["date"] != today:
        _daily_counter["date"] = today
        _daily_counter["count"] = 0
    if _daily_counter["count"] >= MAX_DAILY_GENERATIONS:
        raise HTTPException(status_code=429, detail="Daily generation limit reached. Please try again tomorrow.")
    _daily_counter["count"] += 1


# ── Request models ──

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
    user_identifier: str
    college: str
    location: str = ""
    major: str
    concentration: Optional[str] = None
    plan_text: str


class UpdateSavedPlanRequest(BaseModel):
    plan_id: int
    plan_text: str


# ── Endpoints ──

@app.post("/check-concentration")
@limiter.limit("10/minute")
def concentration_check(request: Request, body: ConcentrationCheckRequest):
    if not body.college.strip() or not body.major.strip():
        raise HTTPException(status_code=400, detail="College and major are required")

    result = check_concentration(body.college, body.location, body.major)
    return result


@app.post("/generate-plan")
@limiter.limit("5/day")  # per-IP limit — tune as needed
def generate_plan(request: Request, body: PlanRequest):
    if not body.college.strip() or not body.major.strip():
        raise HTTPException(status_code=400, detail="College and major are required")
    if len(body.college) > 100 or len(body.major) > 100:
        raise HTTPException(status_code=400, detail="Input too long")

    # 1. Check cache first — completely free if it's a hit
    cached = get_cached_plan(body.college, body.location, body.major, body.concentration)
    if cached:
        print(f"✅ CACHE HIT for {body.college} / {body.major} / {body.concentration}")
        return {"status": "complete", "plan": cached, "from_cache": True}

    # 2. Global daily cap — protects against runaway costs
    check_global_daily_limit()

    # 3. Cache miss — actually generate it
    print(f"❌ CACHE MISS — generating for {body.college} / {body.major} / {body.concentration}")
    result = generate_plan_agentic(body.college, body.location, body.major, body.concentration)

    # 4. Save to cache for next time (only if generation succeeded)
    if result.get("status") == "complete" and "Could not complete" not in result.get("plan", ""):
        save_cached_plan(body.college, body.location, body.major, body.concentration, result["plan"])

    result["from_cache"] = False
    return result


@app.post("/edit-plan")
@limiter.limit("3/day")  # edits are cheap, but still capped to prevent abuse
def edit_plan_endpoint(request: Request, body: EditPlanRequest):
    if not body.current_plan.strip() or not body.edit_request.strip():
        raise HTTPException(status_code=400, detail="Current plan and edit request are required")

    if count_course_mentions(body.edit_request) > 1:
        raise HTTPException(
            status_code=400,
            detail="Please request one course change at a time. Submit additional changes separately.",
        )

    updated = edit_plan(body.current_plan, body.edit_request, body.college)
    return {"status": "complete", "plan": updated}


@app.post("/save-plan")
def save_plan(body: SavePlanRequest):
    """Saves a plan for a specific user so they can revisit/edit it later."""
    plan_id = save_user_plan(
        body.user_identifier, body.college, body.location, body.major, body.concentration, body.plan_text
    )
    return {"status": "saved", "plan_id": plan_id}


@app.put("/save-plan")
def update_saved_plan(body: UpdateSavedPlanRequest):
    update_user_plan(body.plan_id, body.plan_text)
    return {"status": "updated"}


@app.get("/saved-plans/{user_identifier}")
def list_saved_plans(user_identifier: str):
    return {"plans": get_user_plans(user_identifier)}


@app.get("/saved-plans/detail/{plan_id}")
def get_saved_plan(plan_id: int):
    plan = get_user_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@app.get("/health")
def health_check():
    return {"status": "ok"}