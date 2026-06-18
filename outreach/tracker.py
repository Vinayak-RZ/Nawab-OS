from memory.sql_store import log_outreach, get_recent_outreach, update_contact, search_contacts
from datetime import datetime, timedelta

def mark_sent(contact_name: str, channel: str, subject: str = None, body: str = None):
    contacts = search_contacts(contact_name)
    if not contacts:
        return {"error": f"Contact '{contact_name}' not found"}
    contact = contacts[0]
    log_id = log_outreach(contact["id"], channel=channel, direction="sent", subject=subject, body=body)
    followup_date = (datetime.now() + timedelta(days=3)).isoformat()
    update_contact(contact["id"], last_contacted_at=datetime.now().isoformat(),
                   status="contacted", next_followup_at=followup_date)
    return {"log_id": log_id, "contact": contact["name"], "followup_scheduled": followup_date[:10]}

def mark_responded(contact_name: str):
    contacts = search_contacts(contact_name)
    if not contacts:
        return {"error": f"Contact '{contact_name}' not found"}
    contact = contacts[0]
    update_contact(contact["id"], status="responded", next_followup_at=None, updated_at=datetime.now().isoformat())
    return {"message": f"{contact['name']} marked as responded"}

def get_campaign_status(campaign_id: int = None) -> dict:
    from memory.sql_store import get_campaign, list_campaign_drafts, list_campaigns

    if campaign_id:
        camp = get_campaign(campaign_id)
        if not camp:
            return {"error": "campaign not found"}
        drafts = list_campaign_drafts(campaign_id)
        by_status = {}
        for d in drafts:
            s = d.get("status") or "draft"
            by_status[s] = by_status.get(s, 0) + 1
        return {
            "campaign_id": campaign_id,
            "status": camp.get("status"),
            "drafts_total": len(drafts),
            "by_status": by_status,
        }

    recent = get_recent_outreach(days=30)
    by_channel = {}
    for r in recent:
        ch = r.get("channel", "unknown")
        by_channel[ch] = by_channel.get(ch, 0) + 1
    return {
        "total_last_30_days": len(recent),
        "by_channel": by_channel,
        "recent": recent[:5],
        "campaigns": list_campaigns(limit=10),
    }
