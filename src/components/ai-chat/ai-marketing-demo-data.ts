import type { GitStatusEntry } from "@pierre/trees";

import type { AiDemoCodeFile } from "@/components/ai-chat/ai-coding-demo-data";

const pageSource = `import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { Logos } from "@/components/marketing/logos";
import { Navbar } from "@/components/marketing/navbar";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Logos />
      <Features />
    </main>
  );
}
`;

const heroBefore = `import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="py-24">
      <h1>Mainline Next.js template</h1>
      <Button>Get template</Button>
    </section>
  );
}
`;

const heroSource = `import Image from "next/image";
import { ArrowRight, Blend, CircleDot, Diamond } from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  { title: "Tailored workflows", icon: CircleDot },
  { title: "Cross-team projects", icon: Blend },
  { title: "Milestones", icon: Diamond },
];

export function Hero() {
  return (
    <section className="px-8 pb-16 pt-32">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-5xl tracking-tight">Mainline Next.js template</h1>
          <p className="mt-5 text-xl text-muted-foreground">
            An open-source website template built with shadcn/ui,
            Tailwind CSS, and Next.js.
          </p>
          <div className="mt-7 flex gap-2">
            <Button>Get template</Button>
            <Button variant="outline">
              Built by shadcnblocks.com <ArrowRight />
            </Button>
          </div>
        </div>
        <div className="space-y-5 border-l border-dashed pl-8">
          {features.map(({ title, icon: Icon }) => (
            <div key={title} className="flex gap-3">
              <Icon className="size-4" />
              <span>{title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mx-auto mt-12 aspect-[1.72/1] max-w-6xl">
        <Image src="/hero.webp" alt="Product interface" fill />
      </div>
    </section>
  );
}
`;

const navbarSource = `import Image from "next/image";
import { Github } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed left-1/2 top-5 z-50 flex w-[min(88%,700px)] -translate-x-1/2 items-center rounded-full border bg-background/80 px-4 py-3 backdrop-blur">
      <Image src="/logo.svg" alt="Mainline" width={94} height={18} />
      <nav className="mx-auto flex gap-5 text-sm">
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#pricing">Pricing</a>
      </nav>
      <Button size="sm">Get started</Button>
      <Github className="ml-2 size-4" />
    </header>
  );
}
`;

const featuresSource = `import Image from "next/image";

const features = [
  { title: "Purpose-built for product development", image: "/features/triage-card.svg" },
  { title: "Manage projects end-to-end", image: "/features/cycle-card.svg" },
  { title: "Build momentum and healthy habits", image: "/features/overview-card.svg" },
];

export function Features() {
  return (
    <section id="features" className="px-8 py-20">
      <div className="mx-auto max-w-4xl lg:grid lg:grid-cols-2">
        <h2 className="text-4xl tracking-tight">Made for modern product teams</h2>
        <p className="text-muted-foreground">
          Stay focused, move quickly, and aim for high-quality work.
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-6xl overflow-hidden rounded-2xl border lg:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="border-l p-4 first:border-l-0">
            <div className="relative aspect-[1.28/1]">
              <Image src={feature.image} alt="" fill />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
`;

const logosSource = `const customers = ["Mercury", "Linear", "Arc", "Watershed"];

export function Logos() {
  return (
    <section className="border-y bg-muted/20 py-8">
      <p className="text-center text-xs uppercase tracking-widest">
        Designed for teams shipping their best work
      </p>
      <div className="mx-auto mt-6 grid max-w-4xl grid-cols-4 gap-3">
        {customers.map((name) => (
          <div key={name} className="rounded-lg border bg-background p-3 text-center">
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
`;

function file(
  path: string,
  contents: string,
  status: AiDemoCodeFile["status"] = "unchanged",
): AiDemoCodeFile {
  return {
    additions: status === "modified" ? 42 : 0,
    current: { name: path, contents },
    deletions: status === "modified" ? 6 : 0,
    previous: {
      name: path,
      contents: status === "modified" ? heroBefore : contents,
    },
    status,
  };
}

export const aiMarketingFiles = {
  "src/app/page.tsx": file("src/app/page.tsx", pageSource),
  "src/components/marketing/navbar.tsx": file(
    "src/components/marketing/navbar.tsx",
    navbarSource,
  ),
  "src/components/marketing/hero.tsx": file(
    "src/components/marketing/hero.tsx",
    heroSource,
    "modified",
  ),
  "src/components/marketing/logos.tsx": file(
    "src/components/marketing/logos.tsx",
    logosSource,
  ),
  "src/components/marketing/features.tsx": file(
    "src/components/marketing/features.tsx",
    featuresSource,
  ),
  "src/components/ui/button.tsx": file(
    "src/components/ui/button.tsx",
    `export { Button } from "@/components/ui/button";\n`,
  ),
  "src/app/globals.css": file(
    "src/app/globals.css",
    `@import "tailwindcss";\n\n@theme inline {\n  --font-sans: var(--font-dm-sans);\n}\n`,
  ),
} satisfies Record<string, AiDemoCodeFile>;

export const aiMarketingTreePaths = [
  "README.md",
  "package.json",
  "public/hero.webp",
  "public/logo.svg",
  "src/app/page.tsx",
  "src/app/globals.css",
  "src/components/marketing/navbar.tsx",
  "src/components/marketing/hero.tsx",
  "src/components/marketing/logos.tsx",
  "src/components/marketing/features.tsx",
  "src/components/ui/button.tsx",
  "src/lib/utils.ts",
];

export const aiMarketingGitStatus: GitStatusEntry[] = [
  { path: "src/components/marketing/hero.tsx", status: "modified" },
];

export const defaultAiMarketingFile = "src/components/marketing/hero.tsx";
