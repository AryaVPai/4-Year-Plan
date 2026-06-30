import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

import anthropic
from tavily import TavilyClient

claude_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

MODEL = "claude-haiku-4-5-20251001"  # cheapest current model, plenty capable for this task

search_tool = {
    "name": "search_web",
    "description": "Search the web for current information about a college's course catalog or degree requirements",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "The search query"}
        },
        "required": ["query"],
    },
}


def search_web(query: str) -> str:
    """Executes the search via Tavily and returns clean text"""
    try:
        results = tavily_client.search(query, search_depth="advanced", max_results=3)
        combined = ""
        for r in results.get("results", []):
            print(f"  📄 SOURCE: {r['url']}")
            combined += f"\nSource: {r['url']}\n{r['content'][:1000]}\n"
        return combined if combined else "No results found."
    except Exception as e:
        return f"Search failed: {e}"


# ─────────────────────────────────────────────
# 1. Check if a major has concentrations/tracks
# ─────────────────────────────────────────────

def check_concentration(college: str, location: str, major: str) -> dict:
    location_text = f" in {location}" if location else ""
    query = f"{college}{location_text} {major} degree concentrations tracks options"
    print(f"🔍 CONCENTRATION CHECK: {query}")
    search_result = search_web(query)

    raw = None
    try:
        response = claude_client.messages.create(
            model=MODEL,
            max_tokens=300,
            system="""You check if a college major requires students to pick a concentration, 
track, or specialization that significantly changes their required coursework.

Respond ONLY with valid JSON, one of:
{"has_concentrations": false}
{"has_concentrations": true, "options": ["Track 1", "Track 2", "Track 3"]}

No other text. Just JSON.""",
            messages=[
                {
                    "role": "user",
                    "content": f"""Based on these search results about {major} at {college}{location_text}, 
does this major require choosing a concentration/track?

{search_result}

Reply with JSON only.""",
                }
            ],
        )
        raw = response.content[0].text.strip()
        print(f"🤖 RAW CLAUDE RESPONSE: {raw}")
        raw_clean = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw_clean)
        print(f"🎯 CONCENTRATION RESULT: {result}")
        return result
    except Exception as e:
        print(f"⚠️ CONCENTRATION CHECK ERROR: {e}")
        print(f"⚠️ RAW TEXT THAT FAILED TO PARSE: {raw if raw is not None else 'N/A — API call itself failed'}")
        return {"has_concentrations": False}


# ─────────────────────────────────────────────
# 2. Generate the full 4-year plan (agentic loop)
# ─────────────────────────────────────────────

SYSTEM_PROMPT = """You are an academic advisor building accurate 4-year course plans.

Rules:
- You MUST search at least 3 times before writing the final plan:
    1. Search for the official degree requirements
    2. Search for the department's SUGGESTED or RECOMMENDED 4-year sequence
    3. Search for the specific concentration/track's required courses (if applicable)
- Never rely on your own memory for course numbers — they change over time.
- Once you have enough real data, write the complete plan as plain text (no more tool calls).
- The final plan must include:
    * Semester by semester (Year 1 Fall, Year 1 Spring, etc.)
    * 4-5 courses per semester
    * Course name and number, credit hours
    * Which requirement it fulfills (major core, gen ed, elective, etc.)
    * Notes on prerequisites where relevant
- Do NOT say "consult an advisor" or "I need more info" — produce the full plan.
- For electives, pick reasonable common choices and note they are flexible.
- Follow the department's suggested sequence above all else for ordering.
- Respect prerequisite chains — never place a course before its prerequisite.
- Year 1 Fall should be the lightest/most introductory.
- Cite source URLs at the very end."""


def generate_plan_agentic(college: str, location: str, major: str, concentration: str = None) -> dict:
    """Runs Claude's native tool-use loop to research and build the plan."""
    location_text = f" located in {location}" if location else ""
    concentration_text = f", {concentration} concentration" if concentration else ""

    messages = [
        {
            "role": "user",
            "content": f"""Build a complete 4-year academic plan for a student at 
{college}{location_text} studying {major}{concentration_text}.

Search at least 3 times (requirements, suggested sequence, concentration-specific courses) 
before writing the plan.""",
        }
    ]

    max_loops = 8
    search_count = 0

    for i in range(max_loops):
        response = claude_client.messages.create(
            model=MODEL,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=[search_tool],
            messages=messages,
        )

        messages.append({"role": "assistant", "content": response.content})

        tool_use_blocks = [b for b in response.content if b.type == "tool_use"]

        if tool_use_blocks:
            tool_results = []
            for block in tool_use_blocks:
                if block.name == "search_web":
                    query = block.input.get("query", "")
                    print(f"\n🔍 SEARCHING ({search_count + 1}): {query}")
                    result = search_web(query)
                    search_count += 1

                    tool_results.append(
                        {"type": "tool_result", "tool_use_id": block.id, "content": result}
                    )

            messages.append({"role": "user", "content": tool_results})
            continue

        else:
            final_text = "".join(b.text for b in response.content if b.type == "text")

            if search_count < 2:
                messages.append(
                    {
                        "role": "user",
                        "content": "You haven't searched enough yet. Please search at least 2-3 times for accurate, current course data before writing the plan.",
                    }
                )
                continue

            return {"status": "complete", "plan": final_text}

    return {"status": "complete", "plan": "Could not complete research in time. Please try again."}


# ─────────────────────────────────────────────
# 3. Cheap edit — single course swap, with verification + cascade warning
# ─────────────────────────────────────────────

COURSE_CODE_PATTERN = re.compile(r"\b([A-Z]{2,5})\s?-?\s?(\d{3,5})\b")


def count_course_mentions(text: str) -> int:
    """Rough check: counts distinct course code mentions in the edit request."""
    matches = COURSE_CODE_PATTERN.findall(text)
    return len(set(matches))


def edit_plan(current_plan: str, edit_request: str, college: str = "") -> str:
    """
    Modifies an existing plan based on a single requested course change.
    Cheap by default (one Haiku call, no agentic loop) — but:
      - If the edit mentions a specific course code, we run ONE verification
        search so we don't hallucinate the course name/credits (e.g. SCLA 101).
      - The model is instructed to flag any cascading prerequisite conflicts
        caused by the swap, based on what's visible in the plan itself.
    """
    verified_course_info = ""

    match = COURSE_CODE_PATTERN.search(edit_request)
    if match:
        course_code = f"{match.group(1)} {match.group(2)}"
        query = f"{college} {course_code} course name credits" if college else f"{course_code} course name credits"
        print(f"🔍 VERIFYING COURSE: {query}")
        search_result = search_web(query)
        verified_course_info = (
            f"\n\nVerified info about {course_code} from a web search "
            f"(use this exact course name/credits, do not guess):\n{search_result}"
        )

    response = claude_client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system="""You edit existing 4-year academic plans based on a single requested course change.

Rules:
- Keep the same format and all unaffected parts of the plan exactly the same.
- Only change what the student asked you to change — this should be ONE course swap.
- If verified course information is provided below, you MUST use the exact course name and 
  credit hours from it — never guess or substitute a course name from memory, even if it 
  sounds plausible. Course codes can be misleading (e.g. SCLA 101 is NOT a language course).
- After making the swap, check the REST of the plan: if any later course lists the course 
  being removed as a prerequisite (based on notes already in the plan), add a short warning 
  immediately after the plan text explaining which later courses may now have an unmet 
  prerequisite, and recommend the student confirm with an advisor before registering.
- If no such conflict exists, do not add any warning.

Return the complete updated plan, followed by the warning section if applicable.""",
        messages=[
            {
                "role": "user",
                "content": f"""Current plan:
{current_plan}

Requested change: {edit_request}
{verified_course_info}

Return the complete updated plan.""",
            }
        ],
    )
    return response.content[0].text