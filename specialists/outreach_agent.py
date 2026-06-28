from llm.router import complete
from memory.sql_store import get_contact, search_contacts, search_companies
from memory.vector_store import search as mem_search
from config import config
import json

async def draft_email(contact_name: str = None, contact_id: int = None,
                      company_name: str = None, custom_context: str = "") -> dict:
    """Generate a personalized outreach email."""

    contact = None
    company_summary = ""

    if contact_id:
        contact = get_contact(contact_id)
    elif contact_name:
        results = search_contacts(contact_name)
        if results:
            contact = results[0]

    if company_name or (contact and contact.get("company")):
        cn = company_name or contact.get("company")
        companies = search_companies(cn)
        if companies and companies[0].get("research_summary"):
            try:
                cs = json.loads(companies[0]["research_summary"])
                company_summary = json.dumps(cs, indent=2)
            except Exception:
                company_summary = companies[0].get("research_summary", "")

    # Build personalization context
    contact_info = ""
    if contact:
        contact_info = f"""
Contact Name: {contact.get('name')}
Role: {contact.get('role', 'Unknown')}
Company: {contact.get('company', 'Unknown')}
LinkedIn: {contact.get('linkedin_url', '')}
Previous Notes: {contact.get('notes', '')}
"""

    messages = [
        {"role": "system", "content": f"""You are a cold outreach expert helping {config.my_name}, {config.my_role} at {config.company_name}.
{config.company_name}: {config.my_one_liner}

Write short, human, personalized cold emails. No fluff. No generic openers.
Max 5 sentences. End with a single, low-friction CTA."""},
        {"role": "user", "content": f"""Draft a cold outreach email.

SENDER:
Name: {config.my_name}
Role: {config.my_role}
Company: {config.company_name}
What we do: {config.my_one_liner}

RECIPIENT:
{contact_info if contact_info else f"Name: {contact_name or 'Unknown'}, Company: {company_name or 'Unknown'}"}

COMPANY RESEARCH:
{company_summary[:1500] if company_summary else "No research available yet. Use general personalization."}

ADDITIONAL CONTEXT:
{custom_context}

Respond in this exact JSON format:
{{
  "subject": "",
  "body": "",
  "linkedin_variant": "",
  "personalization_notes": ""
}}
Only output JSON."""}
    ]

    raw = await complete(messages, task_type="outreach")
    clean = raw.strip().replace("```json", "").replace("```", "").strip()

    try:
        draft = json.loads(clean)
    except Exception:
        draft = {"subject": "Following up", "body": raw[:1000], "linkedin_variant": "", "personalization_notes": ""}

    # Attach recipient details so the email can actually be sent later.
    draft["to_email"] = contact.get("email") if contact else None
    draft["contact_name"] = contact.get("name") if contact else (contact_name or "")
    draft["company_name"] = (contact.get("company") if contact else None) or company_name or ""
    return draft


async def draft_campaign_strategy(research_batch: list, brief: str = "") -> dict:
    """One LLM call over cohort research → strategy JSON."""
    payload = json.dumps({"brief": brief, "companies": research_batch}, indent=2)[:10000]
    messages = [
        {"role": "system", "content": f"B2B outreach strategist for {config.company_name}."},
        {"role": "user", "content": f"""Cohort research:
{payload}
JSON only: cohort_label, awareness_stage, lead_type, framing_rules, email_tone, whatsapp_tone"""},
    ]
    raw = await complete(messages, task_type="analysis")
    clean = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(clean)
    except Exception:
        return {"cohort_label": "Outreach", "framing_rules": [clean[:400]]}


def _skill_block() -> str:
    try:
        from agent.skill_loader import load_skill_bodies
        return load_skill_bodies(["b2b-cold-email", "whatsapp-outreach", "direct-response-copy"], max_chars=4000)
    except Exception:
        return ""


async def draft_email_for_campaign(
    contact_id: int,
    strategy: dict = None,
    brief: str = "",
    company_research: dict = None,
    template: dict = None,
) -> dict:
    contact = get_contact(contact_id)
    if not contact:
        return {"error": "contact not found", "subject": "", "body": ""}
    strategy = strategy or {}
    template = template or {}
    research = company_research or {}
    skills = _skill_block()
    research_block = json.dumps({
        "narrative": (research.get("narrative") or "")[:2000],
        "summary": (research.get("summary") or "")[:800],
        "web_hits": (research.get("web_hits") or [])[:3],
    }, indent=2)[:3500]
    messages = [
        {"role": "system", "content": f"""You write B2B cold email for {config.my_name} at {config.company_name}.
{config.my_one_liner}
Rules: max 5 sentences, one CTA, no fabricated proof, use company-specific hooks from research.
{skills}"""},
        {"role": "user", "content": f"""Batch template (personalize for this company + contact):
Subject template: {template.get('email_subject') or ''}
Body template: {(template.get('email_body') or '')[:1500]}

Strategy: {json.dumps(strategy)[:1500]}
Brief: {brief}

COMPANY RESEARCH (must influence the message):
{research_block}

Contact: {contact.get('name')} — {contact.get('role')} @ {contact.get('company')}
Notes: {contact.get('notes') or ''}

JSON: subject, body, personalization_notes"""},
    ]
    raw = await complete(messages, task_type="outreach")
    clean = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        draft = json.loads(clean)
    except Exception:
        draft = {"subject": "Quick question", "body": raw[:800], "personalization_notes": ""}
    draft["to_email"] = contact.get("email")
    return draft


async def draft_whatsapp_for_campaign(
    contact_id: int,
    strategy: dict = None,
    brief: str = "",
    company_research: dict = None,
    template: dict = None,
) -> dict:
    contact = get_contact(contact_id)
    if not contact:
        return {"error": "contact not found", "body": ""}
    strategy = strategy or {}
    template = template or {}
    research = company_research or {}
    skills = _skill_block()
    research_block = (research.get("summary") or research.get("narrative") or "")[:800]
    messages = [
        {"role": "system", "content": f"""WhatsApp opener for {config.my_name} at {config.company_name}.
Max 280 chars. Human, specific, no spam patterns. Use company research hooks.
{skills}"""},
        {"role": "user", "content": f"""Template: {(template.get('whatsapp_body') or '')[:400]}
Strategy: {json.dumps(strategy)[:1000]}
Brief: {brief}
Company research: {research_block}
Contact: {contact.get('name')} @ {contact.get('company')}

JSON: body, personalization_notes"""},
    ]
    raw = await complete(messages, task_type="outreach", max_tokens=200)
    clean = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        draft = json.loads(clean)
    except Exception:
        draft = {"body": raw[:280], "personalization_notes": ""}
    draft["body"] = (draft.get("body") or "")[:300]
    return draft


async def ai_edit_draft(
    draft: dict,
    instruction: str,
    company_research: dict = None,
    dossier: str = "",
    brief: str = "",
) -> dict:
    """Rewrite draft subject/body per user instruction."""
    instruction = (instruction or "").strip()
    if not instruction:
        return {"error": "instruction required"}

    research = company_research or {}
    channel = draft.get("channel") or "email"
    messages = [
        {"role": "system", "content": f"""You edit outreach copy for {config.my_name} at {config.company_name}.
Apply the user's instruction precisely. Keep facts from research only — do not invent.
Channel: {channel}. {'Max 300 chars for WhatsApp.' if channel == 'whatsapp' else 'Max 5 sentences for email.'}"""},
        {"role": "user", "content": f"""Instruction: {instruction}

Brief: {brief}

Company research:
{(research.get('narrative') or research.get('summary') or '')[:2500]}

Campaign dossier excerpt:
{(dossier or '')[:4000]}

Current draft:
Subject: {draft.get('subject') or ''}
Body: {draft.get('body') or ''}

JSON: {"subject, body, personalization_notes" if channel == "email" else "body, personalization_notes"}"""},
    ]
    raw = await complete(messages, task_type="outreach", max_tokens=400 if channel == "whatsapp" else 800)
    clean = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        out = json.loads(clean)
    except Exception:
        out = {"body": clean[:300 if channel == "whatsapp" else 2000]}
    if channel == "whatsapp":
        out["body"] = (out.get("body") or "")[:300]
    return out

async def draft_linkedin_message(contact_name: str, company_name: str = "", context: str = "") -> str:
    """Draft a short LinkedIn connection request note (300 char limit)."""
    messages = [
        {"role": "system", "content": f"You write LinkedIn connection request notes for {config.my_name} at {config.company_name}. Max 280 characters. Human, specific, no buzzwords."},
        {"role": "user", "content": f"Write a LinkedIn note to {contact_name} at {company_name}. Context: {context or config.my_one_liner}. Only output the note text, nothing else."}
    ]
    result = await complete(messages, task_type="outreach", max_tokens=100)
    return result.strip()[:300]
