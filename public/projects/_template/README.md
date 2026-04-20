# Project Template

Use this folder as a starting point for any new project you want to showcase.

## How to add a new project

### Step 1: Create a project folder
Copy this `_template` folder and rename it to your project name:
```
projects/
  _template/       ← this template
  my-cool-app/     ← your new project
  research-paper/  ← another project
```

### Step 2: Add your project files
Drop ANY files into your project folder. The portfolio supports everything:
- **PDFs** — research papers, reports, certificates
- **Images** — screenshots, renders, photos (`.jpg`, `.png`, `.webp`, `.svg`)
- **Code** — source files, repos, scripts
- **Videos** — demo recordings, walkthroughs (link to YouTube/Vimeo or host `.mp4`)
- **3D / VR** — Unity builds, WebGL exports, model files
- **Documents** — Word docs, slide decks, spreadsheets
- **Anything else** — the system is format-agnostic

### Step 3: Register it in the portfolio
Open `js/site.js` and add an entry to the `projects` array:

```javascript
{
  title: "My Project Name",
  type: "Software",          // Category: Software, Research, Creative, Design, Writing, etc.
  description: "A short description of what this project is and why it matters.",
  tags: ["React", "Python"], // Technologies or keywords
  thumbnail: "projects/my-cool-app/thumbnail.jpg",  // Optional image
  link: "https://github.com/you/repo",              // Or "projects/my-cool-app/paper.pdf"
  date: "2026",
  file: "projects/my-cool-app/demo.pdf"             // Optional: attached file
}
```

### Supported `type` categories
These auto-generate filter buttons on the portfolio page:
- `Software` — apps, tools, websites, scripts
- `Research` — papers, studies, analyses
- `Creative` — art, VR, games, music, video
- `Design` — UI/UX, branding, design systems
- `Writing` — articles, essays, documentation
- Add your own! Any new `type` string creates a new filter automatically.

### Tips
- **Thumbnail**: Use a 16:9 image (e.g., 800x450px) for best results. Place it in your project folder.
- **Links**: Can point to external URLs, local files, or separate HTML pages in `/pages/`.
- **Tags**: Keep them short (1-2 words each). They render as small chips on the card.
- **Order**: Projects display in the order they appear in the array. Put your best work first.
