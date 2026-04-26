# How to Put Your Website Live at www.michaelquintin.com

This guide covers everything: initial setup, hosting, and the automated publish tool that keeps your site and ontology up to date.

---

## Part 1 — Initial Setup (Do This Once)

### 1.1 Install Git on Your Mac

Open **Terminal** (search for it in Spotlight) and run:

```bash
git --version
```

If Git is installed, you'll see a version number. If not, macOS will prompt you to install it — click Install.

### 1.2 Install Python Dependencies

The publish tool uses Python (which comes pre-installed on macOS). Run:

```bash
pip3 install anthropic PyPDF2 python-docx
```

### 1.3 Get a Claude API Key

1. Go to **https://console.anthropic.com/settings/keys**
2. Create an account (or log in)
3. Click **Create Key**
4. Copy the key (it starts with `sk-ant-...`)
5. Open the file `tools/config.json` in your website folder and replace `YOUR_API_KEY_HERE` with your key:

```json
{
  "anthropic_api_key": "sk-ant-your-actual-key-here",
  "model": "claude-sonnet-4-20250514",
  "site_root": "..",
  "github_repo": "mrquintin/mrquintin.github.io",
  "auto_push": true
}
```

**Important**: This file is listed in `.gitignore` so it will NEVER be uploaded to GitHub. Your API key stays on your computer only.

### 1.4 Create the GitHub Repository

1. Go to **https://github.com** and log in as **mrquintin**
2. Click **+** → **New repository**
3. Repository name: `mrquintin.github.io`
4. Make sure **Public** is selected
5. Leave everything else unchecked
6. Click **Create repository**

### 1.5 Push Your Website to GitHub

Open Terminal, navigate to your website folder, and run these commands:

```bash
cd ~/path/to/Personal_Website
git init
git add -A
git commit -m "Initial site upload"
git branch -M main
git remote add origin https://github.com/mrquintin/mrquintin.github.io.git
git push -u origin main
```

Replace `~/path/to/Personal_Website` with wherever the folder is on your Mac.

If GitHub asks for authentication, you'll need a **Personal Access Token**:
1. Go to https://github.com/settings/tokens → **Generate new token (classic)**
2. Give it a name like "website", check the **repo** scope
3. Click **Generate token** and copy it
4. Use this token as your password when Git prompts you

### 1.6 Enable GitHub Pages

1. Go to **https://github.com/mrquintin/mrquintin.github.io/settings/pages**
2. Under "Source", select **Deploy from a branch**
3. Under "Branch", select **main** / **/ (root)**
4. Click **Save**

Within 2 minutes your site will be live at `https://mrquintin.github.io`.

### 1.7 Connect Your Custom Domain

**On GitHub:**
1. Still on Settings → Pages
2. Under **Custom domain**, type: `www.michaelquintin.com`
3. Click **Save**

**On your domain registrar** (wherever you bought the domain — GoDaddy, Namecheap, Cloudflare, etc.):

Find "DNS Management" and add these records:

| Type  | Name/Host | Value                    | TTL       |
|-------|-----------|--------------------------|-----------|
| CNAME | www       | mrquintin.github.io      | Automatic |
| A     | @         | 185.199.108.153          | Automatic |
| A     | @         | 185.199.109.153          | Automatic |
| A     | @         | 185.199.110.153          | Automatic |
| A     | @         | 185.199.111.153          | Automatic |

The CNAME makes `www.michaelquintin.com` work. The four A records make `michaelquintin.com` (without www) work. These are GitHub's official IP addresses.

After 15-60 minutes, go back to GitHub Pages settings and check **Enforce HTTPS**.

---

## Part 2 — Publishing New Work (The Automated Workflow)

This is the main thing you'll do going forward. Whenever you create something new — a paper, a project, an essay, a game, anything — you run one command and the tool:

1. Reads your project files (PDF, code, markdown, Word docs, etc.)
2. Sends the content to Claude, which analyzes it
3. Claude generates a portfolio card AND figures out what concepts your work explores
4. Those concepts get added to your ontology graph with connections to your existing ideas
5. Everything gets committed and pushed to GitHub
6. Your live site updates in about a minute

### How to Publish

Open Terminal, navigate to your website folder, and run:

```bash
cd ~/path/to/Personal_Website
python3 tools/publish.py ~/path/to/your/project
```

That's it. The tool handles everything else.

### Examples

**Publish a research paper (PDF):**
```bash
python3 tools/publish.py ~/Documents/distributed-systems-paper.pdf
```

**Publish a code project (folder):**
```bash
python3 tools/publish.py ~/Code/my-vr-game/
```

**Publish an essay (markdown):**
```bash
python3 tools/publish.py ~/Writing/ai-ethics-essay.md
```

**Publish with a custom title and type:**
```bash
python3 tools/publish.py ~/Design/brand-identity/ --title "Brand Identity System" --type Design
```

**Preview what Claude would generate (without changing anything):**
```bash
python3 tools/publish.py ~/Documents/paper.pdf --dry-run
```

**Update files locally without pushing to GitHub:**
```bash
python3 tools/publish.py ~/Code/project/ --no-push
```

### What Happens Step by Step

When you run the command:

1. The tool reads your files and shows a summary
2. It sends the content to Claude for analysis
3. Claude responds with:
   - A **project card** (title, type, description, tags)
   - **New concept nodes** for the ontology (the ideas in your work)
   - **New connections** between existing concepts that your work reveals
4. You see a preview of all changes and are asked to confirm
5. On confirmation, the tool:
   - Copies your project files into `projects/your-project-name/`
   - Adds the project card to `js/site.js`
   - Adds the ontology nodes and connections to `js/ontology-data.js`
   - Commits and pushes to GitHub
6. Your site updates live in ~1 minute

### Options

| Flag | What it does |
|------|-------------|
| `--title "Name"` | Override the project title (otherwise Claude picks one) |
| `--type Software` | Override the category: Software, Research, Creative, Design, Writing |
| `--dry-run` | Preview Claude's analysis without changing any files |
| `--no-push` | Update local files but don't push to GitHub |
| `--no-copy` | Don't copy project files to the site (just update the data) |

---

## Part 3 — What Each File Does

| File | Purpose |
|------|---------|
| `index.html` | Main site — all sections (hero, about, projects, resume, blog, contact) |
| `js/site.js` | **Project cards, resume, blog data** — the publish tool auto-updates this |
| `js/ontology-data.js` | **Concept graph data** — the publish tool auto-updates this |
| `css/style.css` | All styling and theme variables |
| `pages/ontology.html` | The interactive ontology graph page |
| `pages/project-detail.html` | Template for detailed project write-ups |
| `blog/post-template.html` | Template for blog articles |
| `projects/` | Folder for project files (the tool copies files here automatically) |
| `tools/publish.py` | The publish CLI tool |
| `tools/config.json` | Your API key and settings (never uploaded to GitHub) |
| `CNAME` | Tells GitHub your custom domain |
| `.gitignore` | Protects config.json from being pushed |

---

## Part 4 — Manual Editing

You can also edit anything by hand if you prefer.

**Edit the ontology manually:**
Open `js/ontology-data.js` and add a node to the `ONTOLOGY_NODES` array:
```javascript
{
  id: "my-concept",
  label: "My Concept",
  category: "philosophy",
  description: "What this concept means.",
  size: "md",
  links: ["emergence", "complexity"]
}
```

**Edit a project card manually:**
Open `js/site.js` and add to the `projects` array:
```javascript
{
  title: "Project Name",
  type: "Software",
  description: "What it does.",
  tags: ["React", "AI"],
  link: "#",
  date: "2026"
}
```

**Push manual changes:**
```bash
cd ~/path/to/Personal_Website
git add -A
git commit -m "Manual update"
git push
```

---

## Troubleshooting

**"pip3: command not found":**
Run `python3 -m pip install anthropic PyPDF2 python-docx` instead.

**"git: command not found":**
Install Xcode command line tools: `xcode-select --install`

**publish.py says "API key not set":**
Edit `tools/config.json` and paste your Anthropic API key.

**Site shows 404 after pushing:**
Check that `index.html` is at the root level of the repository (not inside a subfolder).

**Ontology page is blank:**
Check the browser console (right-click → Inspect → Console) for JavaScript errors. Usually means a syntax issue in `ontology-data.js`.

**DNS not working:**
Wait up to 48 hours. Flush DNS cache on Mac: `sudo dscacheutil -flushcache`

**Git asks for password every time:**
Cache your credentials: `git config --global credential.helper osxkeychain`

---

## Quick Reference

| What | Command / URL |
|------|--------------|
| Publish new work | `python3 tools/publish.py ~/path/to/project` |
| Preview without changes | `python3 tools/publish.py ~/path/to/project --dry-run` |
| Push manual edits | `git add -A && git commit -m "update" && git push` |
| Your live site | https://www.michaelquintin.com |
| Ontology page | https://www.michaelquintin.com/pages/ontology.html |
| GitHub repo | https://github.com/mrquintin/mrquintin.github.io |
| GitHub Pages settings | https://github.com/mrquintin/mrquintin.github.io/settings/pages |
| API key management | https://console.anthropic.com/settings/keys |
