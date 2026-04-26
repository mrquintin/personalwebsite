// Single source of truth for who Michael is, used by the shell, the
// about page, the LLM persona, and the landing hero. The new fields
// (fullName, tagline, summary, email, location, currentRole) were
// introduced in suite 20/P02 for v2 voice; the legacy fields
// (name, roles, based, channels) remain so existing consumers do not
// have to change in the same change set.
const fullName = "Michael Quintin";
const email = "michael@hivemind.ai";
const location = "North America";
const currentRole = "Founder of Hivemind";
const roles = [currentRole, "Author", "Researcher"];

const channels = [
  { label: "email", href: `mailto:${email}` },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/michael-quintin-5555b4283/" },
  { label: "X", href: "https://x.com/quintinpublic" },
  { label: "GitHub", href: "https://github.com/mrquintin" },
];

const identity = {
  fullName,
  name: fullName,
  tagline: "Founder and writer building tools for clear thinking under uncertainty.",
  summary:
    "Michael Quintin is the founder of Hivemind and the author of Purposeless Efficiency. He builds software and writing for operators who reason carefully under uncertainty.",
  email,
  location,
  based: location,
  currentRole,
  roles,
  channels,
};

export default identity;
