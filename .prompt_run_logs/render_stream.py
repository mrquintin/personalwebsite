#!/usr/bin/env python3
"""Render Claude Code stream-json NDJSON as live, human-readable lines."""
import sys, json

def p(s):
    sys.stdout.write(s)
    sys.stdout.flush()

def render_block(block):
    if not isinstance(block, dict):
        return
    t = block.get("type")
    if t == "text":
        p(block.get("text", ""))
    elif t == "tool_use":
        name = block.get("name", "?")
        inp = block.get("input", {}) or {}
        summary = ""
        if isinstance(inp, dict):
            for key in ("file_path", "path", "command", "pattern",
                        "url", "description", "query", "old_string"):
                if key in inp:
                    val = str(inp[key]).replace("\n", " ")
                    summary = val[:160]
                    break
        p("\n\n[TOOL " + str(name) + "] " + summary + "\n")
    elif t == "tool_result":
        content = block.get("content", "")
        if isinstance(content, list):
            for c in content:
                if isinstance(c, dict) and c.get("type") == "text":
                    txt = c.get("text", "")
                    snippet = txt[:200].replace("\n", " ")
                    suffix = " ..." if len(txt) > 200 else ""
                    p("  [result: " + snippet + suffix + "]\n")
        elif isinstance(content, str):
            snippet = content[:200].replace("\n", " ")
            suffix = " ..." if len(content) > 200 else ""
            p("  [result: " + snippet + suffix + "]\n")

for raw in sys.stdin:
    raw = raw.rstrip("\n")
    if not raw:
        continue
    try:
        ev = json.loads(raw)
    except Exception:
        p(raw + "\n")
        continue
    try:
        t = ev.get("type", "")
        if t == "system":
            sub = ev.get("subtype", "")
            if sub == "init":
                model = ev.get("model", "?")
                session = ev.get("session_id", "?")
                p("[session started model=" + str(model) +
                  " session=" + str(session)[:8] + "]\n")
            else:
                p("[system:" + str(sub) + "]\n")
        elif t == "assistant":
            msg = ev.get("message", {}) or {}
            content = msg.get("content", [])
            if isinstance(content, list):
                for b in content:
                    render_block(b)
            else:
                p(str(content))
        elif t == "user":
            msg = ev.get("message", {}) or {}
            content = msg.get("content", [])
            if isinstance(content, list):
                for b in content:
                    render_block(b)
        elif t == "result":
            cost = ev.get("total_cost_usd", "?")
            dur = ev.get("duration_ms", "?")
            turns = ev.get("num_turns", "?")
            p("\n\n[completed: cost=$" + str(cost) +
              " duration=" + str(dur) + "ms turns=" + str(turns) + "]\n")
        else:
            p("\n[" + str(t) + "]\n")
    except Exception as e:
        p("[render-error: " + str(e) + "] " + raw[:200] + "\n")
