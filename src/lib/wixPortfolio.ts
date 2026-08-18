// Portfolio projects for /portfolio (src/pages/portfolio.astro).
//
// Currently HARDCODED, matching how every other CMS-destined list in this project is handled
// today (Services, testimonials, client logos, credentials) — see the root README's "Step 7
// blocker": the Wix CMS collections can't be created via the headless Client ID
// (`collections.createDataCollection()` 403s under visitor auth), so Danielle must create
// them in her dashboard's Content Manager first. Until then, this array is the source.
//
// CMS SWAP (once the collection exists with public read): the handoff README § 8 says wire to
// the `CaseStudies` collection using only these fields — `category`, `title`, `coverImage`,
// `liveUrl`, `linkLabel`, `order` (the richer challenge/whatWeDid/solution/outcome fields are
// intentionally unused by this layout). Replace getPortfolioProjects() below with a
// `@wix/data` query of `CaseStudies` sorted by `order`, mapping those fields onto Project.
// Keep this array as the fallback so the page still renders if the query is empty/unavailable.
//
// Per the client (chat): the first two are REAL projects and carry over exactly. The other
// four stay placeholders — do not invent projects.

export interface Project {
  /** Uppercase category kicker, e.g. "Website Design · Non-Profit". */
  category: string;
  /** Project name (card heading). Placeholders use "[Project name]". */
  title: string;
  /** Cover image URL, or null to render a labeled placeholder plate. */
  coverImage: string | null;
  /** How the cover fills the 4/3 plate. "contain" for logos/brand marks (show the whole
   * thing, letterboxed); "cover" (default) for full-bleed screenshots. */
  imageFit?: "cover" | "contain";
  /** Extra plate padding for a wide "contain" logo that would otherwise run edge to edge —
   * insets it so it sits smaller with breathing room. Any CSS padding value. */
  imagePadding?: string;
  /** Text shown inside the placeholder plate when coverImage is null. */
  imageLabel: string;
  /** External link to the live site; "#" for a not-yet-linked placeholder. */
  liveUrl: string;
  /** Underlined link label, e.g. "Visit the site" / "View the project". */
  linkLabel: string;
  order: number;
}

const PROJECTS: Project[] = [
  {
    category: "Website Design · Non-Profit",
    title: "Travel Visions Aloha for the Blind",
    coverImage: "/images/portfolio-travel-visions.png",
    imageFit: "contain",
    // This logo is very wide (≈4:1); extra horizontal inset keeps it off the plate edges.
    imagePadding: "18px 15%",
    imageLabel: "Screenshot of travelvisionsaloha.org",
    liveUrl: "https://travelvisionsaloha.org/",
    linkLabel: "Visit travelvisionsaloha.org",
    order: 1,
  },
  {
    category: "Website Design · Financial Services",
    title: "Sovereign Legacy Financial Group",
    coverImage: "/images/portfolio-sovereign.avif",
    imageFit: "contain",
    imageLabel: "Screenshot of sovereignlegacyfg.com",
    liveUrl: "https://www.sovereignlegacyfg.com/",
    linkLabel: "Visit sovereignlegacyfg.com",
    order: 2,
  },
  {
    category: "Website Design · E-Commerce",
    title: "Danielle's Closet",
    coverImage: "/images/portfolio-danielles-closet.avif",
    imageFit: "contain",
    imagePadding: "16px 8%",
    imageLabel: "Danielle's Closet logo",
    liveUrl: "https://www.daniellesclosetllc.com/",
    linkLabel: "Visit daniellesclosetllc.com",
    order: 3,
  },
  // To add another project, copy one of the entries above and bump `order`. Drop its cover
  // in public/images and point `coverImage` at it — use imageFit:"contain" (+ matColor is set
  // to white automatically) for a logo/brand mark, or omit imageFit for a full-bleed
  // screenshot. Example:
  // {
  //   category: "Website Design · Retail",
  //   title: "New Project",
  //   coverImage: "/images/portfolio-new-project.png",
  //   imageFit: "contain",
  //   imageLabel: "New Project logo",
  //   liveUrl: "https://example.com/",
  //   linkLabel: "Visit example.com",
  //   order: 4,
  // },
];

export function getPortfolioProjects(): Project[] {
  return [...PROJECTS].sort((a, b) => a.order - b.order);
}
