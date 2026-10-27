import os
import json
import re
from datetime import datetime

EXPORT_DIR = r"d:\DYNAMIC EXAM SITE\exported_conversations"
BRAIN_BASE = r"C:\Users\adhav\.gemini\antigravity-ide\brain"

CONVERSATIONS = [
    {
        "id": "884387c4-bbff-4b94-a621-f26ee7ea4f09",
        "title": "Aknex COE Examination Portal - Main Full Implementation",
        "filename": "1_MAIN_EXAM_PORTAL_SESSION_884387c4.txt"
    },
    {
        "id": "46c4922a-f93e-49fa-9921-49ef209f0c25",
        "title": "Lost Chat History Investigation & Diagnostic Recovery",
        "filename": "2_RECOVERY_SESSION_1_46c4922a.txt"
    },
    {
        "id": "eaeb9fa7-c618-4cde-81f2-eff6aaa71973",
        "title": "Lost IDE Session & WAL Database Inspection",
        "filename": "3_RECOVERY_SESSION_2_eaeb9fa7.txt"
    },
    {
        "id": "dc7cb673-ddfa-4f10-92d3-2bd106aeaf60",
        "title": "Method 3 Database Recovery & URI Bug Normalization",
        "filename": "4_CURRENT_RECOVERY_SESSION_dc7cb673.txt"
    }
]

os.makedirs(EXPORT_DIR, exist_ok=True)

def clean_user_content(raw):
    m = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", raw, re.DOTALL)
    if m:
        content = m.group(1).strip()
    else:
        # Strip system tags if any
        content = re.sub(r"<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>", "", raw, flags=re.DOTALL)
        content = re.sub(r"<USER_SETTINGS_CHANGE>.*?</USER_SETTINGS_CHANGE>", "", content, flags=re.DOTALL)
        content = content.strip()
    return content

def export_conversation(conv_info):
    cid = conv_info["id"]
    title = conv_info["title"]
    out_filename = conv_info["filename"]
    out_path = os.path.join(EXPORT_DIR, out_filename)
    
    logs_dir = os.path.join(BRAIN_BASE, cid, ".system_generated", "logs")
    transcript_file = os.path.join(logs_dir, "transcript_full.jsonl")
    if not os.path.exists(transcript_file):
        transcript_file = os.path.join(logs_dir, "transcript.jsonl")
    
    if not os.path.exists(transcript_file):
        print(f"[!] No transcript found for {cid}")
        return
    
    lines_written = 0
    with open(out_path, "w", encoding="utf-8") as out_f, open(transcript_file, "r", encoding="utf-8", errors="ignore") as in_f:
        # Header
        out_f.write("=" * 80 + "\n")
        out_f.write(f"CONVERSATION EXPORT: {title}\n")
        out_f.write(f"SESSION ID: {cid}\n")
        out_f.write(f"TARGET WORKSPACE: d:\\DYNAMIC EXAM SITE\n")
        out_f.write(f"EXPORT DATE: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        out_f.write("=" * 80 + "\n\n")
        
        step_count = 0
        user_msg_count = 0
        ai_msg_count = 0
        
        for line in in_f:
            if not line.strip():
                continue
            try:
                data = json.loads(line)
            except Exception:
                continue
            
            step_idx = data.get("step_index", step_count)
            step_type = data.get("type", "")
            source = data.get("source", "")
            created = data.get("created_at", "")
            raw_content = data.get("content", "")
            tool_calls = data.get("tool_calls", [])
            
            # Format User Messages
            if step_type == "USER_INPUT" or source == "USER_EXPLICIT":
                user_msg_count += 1
                cleaned = clean_user_content(raw_content)
                if not cleaned:
                    continue
                out_f.write("\n" + "-" * 80 + "\n")
                out_f.write(f"[STEP {step_idx}] [USER] | {created}\n")
                out_f.write("-" * 80 + "\n")
                out_f.write(cleaned + "\n\n")
                lines_written += 1
                
            # Format Assistant Responses
            elif step_type == "PLANNER_RESPONSE" or source == "MODEL":
                ai_msg = raw_content.strip() if raw_content else ""
                
                if ai_msg:
                    ai_msg_count += 1
                    out_f.write("\n" + "~" * 80 + "\n")
                    out_f.write(f"[STEP {step_idx}] [AI ASSISTANT] | {created}\n")
                    out_f.write("~" * 80 + "\n")
                    out_f.write(ai_msg + "\n\n")
                    lines_written += 1
                
                # Format Tool Executions
                if tool_calls:
                    for tc in tool_calls:
                        name = tc.get("name", "Tool")
                        args = tc.get("args", {})
                        if isinstance(args, str):
                            try:
                                args = json.loads(args)
                            except Exception:
                                pass
                        summary = ""
                        if isinstance(args, dict):
                            summary = args.get("toolSummary", "") or args.get("Description", "") or args.get("CommandLine", "") or args.get("TargetFile", "")
                        out_f.write(f"  -> [ACTION: {name}] {summary}\n")
                        lines_written += 1
            
            step_count += 1
            
    print(f"[OK] Exported {cid} to {out_filename} ({user_msg_count} user prompts, {ai_msg_count} AI replies)")

# Run export
for conv in CONVERSATIONS:
    export_conversation(conv)

# Write Master Index
index_path = os.path.join(EXPORT_DIR, "00_INDEX_CONVERSATIONS.txt")
with open(index_path, "w", encoding="utf-8") as idx_f:
    idx_f.write("================================================================================\n")
    idx_f.write("             DYNAMIC EXAM SITE - COMPLETE CONVERSATION ARCHIVE                  \n")
    idx_f.write("================================================================================\n\n")
    idx_f.write("This folder contains human-readable text exports of all AI pair-programming\n")
    idx_f.write("sessions related to the Aknex COE Examination Portal (d:\\DYNAMIC EXAM SITE).\n\n")
    idx_f.write("ARCHIVED SESSIONS:\n")
    idx_f.write("--------------------------------------------------------------------------------\n")
    for idx, c in enumerate(CONVERSATIONS, 1):
        idx_f.write(f"{idx}. {c['filename']}\n")
        idx_f.write(f"   Title:   {c['title']}\n")
        idx_f.write(f"   UUID:    {c['id']}\n\n")
    idx_f.write("================================================================================\n")

print(f"[OK] Generated Master Index at {index_path}")
