#!/usr/bin/env python3
"""
publish.py — Upload a project to your portfolio and auto-generate ontology connections.

Usage:
    python publish.py <path-to-project> [options]

Examples:
    python publish.py ~/Documents/research-paper.pdf
    python publish.py ~/Code/my-vr-game/ --type Creative --title "VR Experience"
    python publish.py ~/Essays/ai-ethics.md --no-push

What it does:
    1. Reads your project file(s) and extracts the content
    2. Sends it to Claude along with your current ontology
    3. Claude analyzes the work and suggests:
       - A project card for the portfolio
       - New ontology nodes (concepts/ideas in your work)
       - Connections to your existing idea web
    4. Updates your site files (site.js + ontology-data.js)
    5. Commits and pushes to GitHub (your site updates in ~1 min)
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from datetime import datetime

# ─── Ensure dependencies are installed ────────────────────────
def check_dependencies():
    missing = []
    try:
        import anthropic
    except ImportError:
        missing.append("anthropic")
    try:
        import PyPDF2
    except ImportError:
        missing.append("PyPDF2")
    try:
        import docx
    except ImportError:
        missing.append("python-docx")
    if missing:
        print(f"\n  Missing packages: {', '.join(missing)}")
        print(f"  Run: pip install {' '.join(missing)}\n")
        sys.exit(1)

check_dependencies()

import anthropic
import PyPDF2


# ─── Configuration ────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "config.json"

def load_config():
    if not CONFIG_PATH.exists():
        print(f"\n  Config file not found: {CONFIG_PATH}")
        print(f"  Copy config.json and add your Anthropic API key.\n")
        sys.exit(1)
    with open(CONFIG_PATH) as f:
        cfg = json.load(f)
    if cfg.get("anthropic_api_key", "").startswith("YOUR"):
        print("\n  Please set your Anthropic API key in tools/config.json")
        print("  Get one at: https://console.anthropic.com/settings/keys\n")
        sys.exit(1)
    return cfg


def static_root(site_root: Path) -> Path:
    """Static assets for Next.js live under public/."""
    return site_root / "public"


# ─── File Reading ─────────────────────────────────────────────
SUPPORTED_TEXT = {'.py', '.js', '.ts', '.html', '.css', '.md', '.txt', '.json',
                  '.yaml', '.yml', '.toml', '.sh', '.c', '.cpp', '.h', '.java',
                  '.rs', '.go', '.rb', '.jsx', '.tsx', '.vue', '.svelte', '.csv'}

def read_file_content(path: Path) -> str:
    """Extract text content from a file."""
    ext = path.suffix.lower()

    if ext == '.pdf':
        return read_pdf(path)
    elif ext == '.docx':
        return read_docx(path)
    elif ext in SUPPORTED_TEXT:
        return path.read_text(errors='replace')[:50000]  # cap at 50k chars
    else:
        return f"[Binary file: {path.name} ({ext})]"

def read_pdf(path: Path) -> str:
    """Extract text from a PDF."""
    text = []
    try:
        with open(path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for i, page in enumerate(reader.pages[:30]):  # cap at 30 pages
                content = page.extract_text()
                if content:
                    text.append(f"--- Page {i+1} ---\n{content}")
    except Exception as e:
        text.append(f"[Error reading PDF: {e}]")
    return '\n'.join(text)[:50000]

def read_docx(path: Path) -> str:
    """Extract text from a Word document."""
    import docx
    try:
        doc = docx.Document(str(path))
        return '\n'.join(p.text for p in doc.paragraphs)[:50000]
    except Exception as e:
        return f"[Error reading docx: {e}]"

def gather_project_content(path: Path) -> dict:
    """Read a file or directory and return structured content."""
    result = {"files": [], "total_chars": 0, "path": str(path)}

    if path.is_file():
        content = read_file_content(path)
        result["files"].append({"name": path.name, "content": content})
        result["total_chars"] = len(content)
    elif path.is_dir():
        for fp in sorted(path.rglob('*')):
            if fp.is_file() and not fp.name.startswith('.'):
                # Skip large binary files and common non-content files
                if fp.suffix.lower() in {'.png', '.jpg', '.jpeg', '.gif', '.mp4',
                                          '.mp3', '.wav', '.zip', '.tar', '.gz',
                                          '.exe', '.dll', '.so', '.o', '.wasm'}:
                    result["files"].append({"name": str(fp.relative_to(path)), "content": f"[Binary: {fp.name}]"})
                    continue
                if fp.stat().st_size > 500_000:  # skip files > 500KB
                    result["files"].append({"name": str(fp.relative_to(path)), "content": f"[Large file skipped: {fp.name}]"})
                    continue
                content = read_file_content(fp)
                result["files"].append({"name": str(fp.relative_to(path)), "content": content})
                result["total_chars"] += len(content)
                if result["total_chars"] > 80000:  # cap total
                    break
    else:
        print(f"\n  Path not found: {path}\n")
        sys.exit(1)

    return result


# ─── Read Current Site Data ───────────────────────────────────
def read_current_data(site_root: Path) -> dict:
    """Read the current ontology and project data from the site."""
    root = static_root(site_root)
    ontology_path = root / "js" / "ontology-data.js"
    site_js_path = root / "js" / "site.js"

    data = {"ontology_raw": "", "site_js_raw": ""}

    if ontology_path.exists():
        data["ontology_raw"] = ontology_path.read_text()
    if site_js_path.exists():
        data["site_js_raw"] = site_js_path.read_text()

    return data


# ─── Claude Analysis ─────────────────────────────────────────
def analyze_with_claude(project: dict, current_data: dict, config: dict,
                        title_override: str = None, type_override: str = None) -> dict:
    """Send project content to Claude for analysis and ontology generation."""

    client = anthropic.Anthropic(api_key=config["anthropic_api_key"])

    # Build the content summary
    file_summaries = []
    for f in project["files"]:
        file_summaries.append(f"### {f['name']}\n{f['content'][:10000]}")
    project_content = '\n\n'.join(file_summaries)

    prompt = f"""You are analyzing a project/work to integrate into a personal portfolio website. You need to produce two things:

1. A PROJECT CARD entry (for the portfolio grid)
2. ONTOLOGY UPDATES (new concept nodes and connections for the idea graph)

Here is the CURRENT ONTOLOGY data (the existing concept web):
```javascript
{current_data['ontology_raw'][:15000]}
```

Here is the PROJECT CONTENT to analyze:
```
{project_content[:40000]}
```

{f'The user specified the title: "{title_override}"' if title_override else ''}
{f'The user specified the type/category: "{type_override}"' if type_override else ''}

Please respond with EXACTLY this JSON structure (no markdown, no explanation, just valid JSON):

{{
  "project": {{
    "title": "Project Name",
    "type": "Software|Research|Creative|Design|Writing",
    "description": "1-2 sentence description of what this project is.",
    "tags": ["Tag1", "Tag2", "Tag3"],
    "date": "{datetime.now().year}"
  }},
  "ontology": {{
    "new_nodes": [
      {{
        "id": "kebab-case-id",
        "label": "Display Name",
        "category": "philosophy|tech|creative|science|systems|social",
        "description": "What this concept is about, in 1-2 sentences.",
        "size": "sm|md|lg",
        "links": ["existing-node-id-1", "existing-node-id-2"]
      }}
    ],
    "new_connections": [
      {{
        "from": "existing-node-id",
        "to": "another-existing-node-id",
        "reason": "Why these should be connected (for the user's reference, not displayed)"
      }}
    ]
  }},
  "summary": "A 1-sentence summary of what was added to the ontology and why."
}}

RULES:
- new_nodes: Create 1-5 concept nodes that represent the KEY IDEAS in this work. Don't create a node for the project itself — create nodes for the concepts it explores.
- Links in new_nodes should connect to EXISTING node IDs from the current ontology. Check the IDs carefully.
- new_connections: Suggest 0-3 new connections between EXISTING nodes that this project reveals (ideas that should be linked but aren't yet).
- Be thoughtful about connections — only link concepts that are genuinely related, not superficially.
- Use the existing categories. Only suggest a new category if nothing fits.
- Size "lg" for central concepts, "md" for supporting ideas, "sm" for niche concepts.
- IDs must be unique kebab-case strings.
"""

    print("  Analyzing with Claude...")
    response = client.messages.create(
        model=config.get("model", "claude-sonnet-4-20250514"),
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )

    # Parse the response
    response_text = response.content[0].text.strip()

    # Try to extract JSON (handle markdown code fences if present)
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if not json_match:
        print("\n  Error: Could not parse Claude's response as JSON.")
        print(f"  Raw response:\n{response_text[:500]}")
        sys.exit(1)

    try:
        result = json.loads(json_match.group())
    except json.JSONDecodeError as e:
        print(f"\n  Error parsing JSON: {e}")
        print(f"  Raw response:\n{response_text[:500]}")
        sys.exit(1)

    return result


# ─── Update Site Files ────────────────────────────────────────
def update_site_js(site_root: Path, project_data: dict):
    """Add a new project to the projects array in site.js."""
    site_js_path = static_root(site_root) / "js" / "site.js"
    content = site_js_path.read_text()

    # Build the new project entry
    p = project_data
    tags_str = ', '.join(f'"{t}"' for t in p.get("tags", []))
    new_entry = f"""  {{
    title: "{p['title']}",
    type: "{p['type']}",
    description: "{p['description']}",
    tags: [{tags_str}],
    thumbnail: "",
    link: "#",
    date: "{p.get('date', datetime.now().year)}"
  }}"""

    # Insert before the closing of the projects array
    # Find the last project entry and add after it
    pattern = r'(const projects = \[)'
    if re.search(pattern, content):
        # Add after the opening bracket
        content = re.sub(
            pattern,
            f'\\1\n{new_entry},',
            content,
            count=1
        )
        site_js_path.write_text(content)
        print(f"  Added project: {p['title']}")
    else:
        print("  Warning: Could not find projects array in site.js — skipping project card update.")


def update_ontology_data(site_root: Path, ontology_data: dict):
    """Add new nodes and connections to ontology-data.js."""
    onto_path = static_root(site_root) / "js" / "ontology-data.js"
    content = onto_path.read_text()

    new_nodes = ontology_data.get("new_nodes", [])
    new_connections = ontology_data.get("new_connections", [])

    if not new_nodes and not new_connections:
        print("  No ontology changes needed.")
        return

    # Add new nodes before the closing bracket of ONTOLOGY_NODES
    if new_nodes:
        entries = []
        for node in new_nodes:
            links_str = ', '.join(f'"{l}"' for l in node.get("links", []))
            entry = f"""  {{
    id: "{node['id']}",
    label: "{node['label']}",
    category: "{node['category']}",
    description: "{node['description']}",
    size: "{node.get('size', 'md')}",
    links: [{links_str}]
  }}"""
            entries.append(entry)

        # Find the last closing of the ONTOLOGY_NODES array
        # Insert new entries before the final ];
        nodes_end = content.rfind('];')
        if nodes_end != -1:
            insert_text = ',\n\n  // ─── Auto-generated: ' + datetime.now().strftime('%Y-%m-%d') + ' ───\n' + ',\n'.join(entries)
            content = content[:nodes_end] + insert_text + '\n' + content[nodes_end:]
            print(f"  Added {len(new_nodes)} ontology node(s): {', '.join(n['label'] for n in new_nodes)}")

    # Add new connections by updating the links arrays of existing nodes
    if new_connections:
        for conn in new_connections:
            from_id = conn['from']
            to_id = conn['to']
            # Find the node with from_id and add to_id to its links
            pattern = rf'(id:\s*"{re.escape(from_id)}"[\s\S]*?links:\s*\[)([^\]]*?)(\])'
            match = re.search(pattern, content)
            if match:
                current_links = match.group(2).strip()
                if f'"{to_id}"' not in current_links:
                    if current_links:
                        new_links = f'{current_links}, "{to_id}"'
                    else:
                        new_links = f'"{to_id}"'
                    content = content[:match.start(2)] + new_links + content[match.end(2):]
                    print(f"  Connected: {from_id} → {to_id}")

    onto_path.write_text(content)


# ─── Copy Project Files ──────────────────────────────────────
def copy_project_files(source: Path, site_root: Path, project_title: str) -> str:
    """Copy project files to the site's projects/ directory."""
    # Create a folder name from the title
    folder_name = re.sub(r'[^a-z0-9]+', '-', project_title.lower()).strip('-')
    dest = static_root(site_root) / "projects" / folder_name
    dest.mkdir(parents=True, exist_ok=True)

    if source.is_file():
        import shutil
        shutil.copy2(source, dest / source.name)
        print(f"  Copied {source.name} → public/projects/{folder_name}/")
    elif source.is_dir():
        import shutil
        for item in source.iterdir():
            if item.name.startswith('.'):
                continue
            if item.is_file():
                shutil.copy2(item, dest / item.name)
            elif item.is_dir():
                shutil.copytree(item, dest / item.name, dirs_exist_ok=True)
        print(f"  Copied project folder → public/projects/{folder_name}/")

    return folder_name


# ─── Git Operations ───────────────────────────────────────────
def git_push(site_root: Path, project_title: str, config: dict):
    """Commit and push changes to GitHub."""
    if not config.get("auto_push", True):
        print("  Auto-push disabled. Commit manually when ready.")
        return

    os.chdir(site_root)

    try:
        # Check if this is a git repo
        subprocess.run(["git", "status"], capture_output=True, check=True, cwd=site_root)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("  Not a git repo — skipping push. Upload files manually to GitHub.")
        return

    try:
        subprocess.run(["git", "add", "-A"], check=True, cwd=site_root)
        msg = f"Add project: {project_title}"
        subprocess.run(["git", "commit", "-m", msg], check=True, cwd=site_root)
        subprocess.run(["git", "push"], check=True, cwd=site_root)
        print(f"  Pushed to GitHub. Site will update in ~1 minute.")
    except subprocess.CalledProcessError as e:
        print(f"  Git error: {e}")
        print("  Changes are saved locally. Push manually with: git add -A && git commit -m 'update' && git push")


# ─── Main ─────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Upload a project to your portfolio and auto-generate ontology connections.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python publish.py ~/Documents/research-paper.pdf
  python publish.py ~/Code/my-app/ --title "My App" --type Software
  python publish.py ~/Essays/essay.md --no-push
  python publish.py ~/Design/mockups/ --type Design --dry-run
        """
    )
    parser.add_argument("path", help="Path to file or folder to publish")
    parser.add_argument("--title", help="Override the project title (otherwise Claude picks one)")
    parser.add_argument("--type", help="Override the project type: Software, Research, Creative, Design, Writing")
    parser.add_argument("--no-push", action="store_true", help="Don't push to GitHub (just update local files)")
    parser.add_argument("--dry-run", action="store_true", help="Show what Claude would generate without changing any files")
    parser.add_argument("--no-copy", action="store_true", help="Don't copy project files to the site (just update data)")

    args = parser.parse_args()
    project_path = Path(args.path).expanduser().resolve()

    print(f"\n{'─' * 50}")
    print(f"  PUBLISH: {project_path.name}")
    print(f"{'─' * 50}\n")

    # Load config
    config = load_config()
    if args.no_push:
        config["auto_push"] = False

    # Resolve site root
    site_root = (SCRIPT_DIR / config.get("site_root", "..")).resolve()

    # 1. Read project content
    print("  Reading project files...")
    project = gather_project_content(project_path)
    print(f"  Found {len(project['files'])} file(s), {project['total_chars']:,} characters\n")

    # 2. Read current site data
    current_data = read_current_data(site_root)

    # 3. Analyze with Claude
    result = analyze_with_claude(project, current_data, config,
                                 title_override=args.title,
                                 type_override=args.type)

    # 4. Show results
    project_info = result.get("project", {})
    ontology_info = result.get("ontology", {})
    summary = result.get("summary", "")

    print(f"\n{'─' * 50}")
    print(f"  PROJECT: {project_info.get('title', 'Unknown')}")
    print(f"  TYPE:    {project_info.get('type', 'Unknown')}")
    print(f"  TAGS:    {', '.join(project_info.get('tags', []))}")
    print(f"{'─' * 50}")

    new_nodes = ontology_info.get("new_nodes", [])
    new_conns = ontology_info.get("new_connections", [])

    if new_nodes:
        print(f"\n  NEW CONCEPTS ({len(new_nodes)}):")
        for n in new_nodes:
            links = ', '.join(n.get('links', []))
            print(f"    • {n['label']} [{n['category']}] → connects to: {links}")

    if new_conns:
        print(f"\n  NEW CONNECTIONS ({len(new_conns)}):")
        for c in new_conns:
            print(f"    • {c['from']} ↔ {c['to']} — {c.get('reason', '')}")

    if summary:
        print(f"\n  SUMMARY: {summary}")

    print(f"\n{'─' * 50}\n")

    if args.dry_run:
        print("  DRY RUN — no files changed.\n")
        return

    # 5. Ask for confirmation
    confirm = input("  Apply these changes? [Y/n] ").strip().lower()
    if confirm and confirm != 'y':
        print("  Cancelled.\n")
        return

    # 6. Update files
    print()
    if not args.no_copy:
        copy_project_files(project_path, site_root, project_info.get("title", "project"))
    update_site_js(site_root, project_info)
    update_ontology_data(site_root, ontology_info)

    # 7. Push to GitHub
    print()
    git_push(site_root, project_info.get("title", "project"), config)

    print(f"\n  Done! Your site will be live at https://www.michaelquintin.com in ~1 minute.\n")


if __name__ == "__main__":
    main()
