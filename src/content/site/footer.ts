export type FooterLink = { label: string; href: string };

export const footerLinks: { external: FooterLink[]; site: FooterLink[] } = {
  external: [
    { label: "GitHub", href: "https://github.com/mrquintin" },
    { label: "Email", href: "mailto:michael@hivemind.ai" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/michael-quintin-5555b4283/" },
  ],
  site: [
    { label: "Changelog", href: "/changelog" },
  ],
};

export default footerLinks;
