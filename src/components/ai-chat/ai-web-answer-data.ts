export const answerSources = [
  {
    id: 1,
    name: "Shadcnblocks",
    domain: "shadcnblocks.com",
    title: "Blocks for shadcn/ui & Tailwind",
    url: "https://www.shadcnblocks.com/",
    summary:
      "Shadcnblocks provides responsive React blocks, components and templates built around shadcn/ui and Tailwind CSS. Its library includes landing-page sections and application interfaces.",
    keywords:
      "what overview react tailwind shadcn components library landing marketing",
  },
  {
    id: 2,
    name: "Block library",
    domain: "shadcnblocks.com",
    title: "Browse the block library",
    url: "https://www.shadcnblocks.com/blocks",
    summary:
      "Browse complete interface sections by category, including heroes, features, pricing, dashboards and data tables. Choose a block as a starting point for a specific part of your product.",
    keywords:
      "blocks categories hero pricing features tables dashboard sections browse free",
  },
  {
    id: 3,
    name: "Templates",
    domain: "shadcnblocks.com",
    title: "Complete website templates",
    url: "https://www.shadcnblocks.com/templates",
    summary:
      "Templates combine multiple sections into complete website designs. The collection includes Next.js and Astro options, with the available framework listed for each template.",
    keywords:
      "templates website pages nextjs next.js astro frameworks complete",
  },
  {
    id: 4,
    name: "Installation",
    domain: "shadcnblocks.com",
    title: "Install with the shadcn CLI",
    url: "https://www.shadcnblocks.com/shadcn-cli",
    summary:
      "The shadcn CLI installs a selected block into your project and resolves its dependencies and required shadcn components. The installation guide explains registry setup and authentication for premium blocks.",
    keywords:
      "install installation cli command dependencies registry setup authentication premium code",
  },
  {
    id: 5,
    name: "Admin Kit",
    domain: "shadcnblocks.com",
    title: "Shadcn Admin Kit",
    url: "https://www.shadcnblocks.com/admin-dashboard",
    summary:
      "The Admin Kit is a Next.js dashboard built with shadcn/ui. It brings together application screens for ecommerce, project management, payments, tasks and developer workflows, with shared navigation and theme support.",
    keywords:
      "admin kit dashboard ecommerce project payments tasks developer dark theme navigation",
  },
];
export const answerMedia = [
  {
    title: "Feature showcase",
    alt: "Feature showcase preview published by Shadcnblocks",
    src: "/ai-chat/web-answer/feature89.webp",
    url: "https://www.shadcnblocks.com/",
    original:
      "https://cdn.shadcnblocks.com/shadcnblocks/images/ui/homepage-montage/feature89.webp",
  },
  {
    title: "Pricing section",
    alt: "Pricing section preview published by Shadcnblocks",
    src: "/ai-chat/web-answer/pricing7.webp",
    url: "https://www.shadcnblocks.com/",
    original:
      "https://cdn.shadcnblocks.com/shadcnblocks/images/ui/homepage-montage/pricing7.webp",
  },
  {
    title: "Testimonials",
    alt: "Testimonials preview published by Shadcnblocks",
    src: "/ai-chat/web-answer/testimonial7.webp",
    url: "https://www.shadcnblocks.com/",
    original:
      "https://cdn.shadcnblocks.com/shadcnblocks/images/ui/homepage-montage/testimonial7.webp",
  },
  {
    title: "Feature layout",
    alt: "Feature layout preview published by Shadcnblocks",
    src: "/ai-chat/web-answer/feature20.webp",
    url: "https://www.shadcnblocks.com/",
    original:
      "https://cdn.shadcnblocks.com/shadcnblocks/images/ui/homepage-montage/feature20.webp",
  },
];
export const researchSteps = [
  "Reviewed the Shadcnblocks product overview",
  "Explored block categories and interface patterns",
  "Compared complete website templates",
  "Checked the CLI installation workflow",
  "Reviewed the Admin Kit and its application screens",
];
export function findAnswerSources(query: string) {
  const words =
    query
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter(
        (w) =>
          w.length > 2 &&
          ![
            "the",
            "and",
            "can",
            "you",
            "how",
            "for",
            "this",
            "that",
            "does",
            "shadcnblocks",
            "what",
          ].includes(w),
      ) ?? [];
  return answerSources
    .flatMap((source) => {
      const x = {
        source,
        score: words.filter((w) =>
          (source.keywords + " " + source.summary).toLowerCase().includes(w),
        ).length,
      };
      return x.score > 0 ? [x] : [];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.source);
}
