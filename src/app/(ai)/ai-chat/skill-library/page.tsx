import { readFile } from "node:fs/promises";
import path from "node:path";

import type { LibrarySkill } from "@/components/ai-chat/ai-skill-library-data";
import { AiSkillLibraryScreen } from "@/components/ai-chat/ai-skill-library-screen";

import manifest from "../../../../../public/ai-chat/skill-library/manifest.json";
export default async function Page() {
  const skills: LibrarySkill[] = await Promise.all(
    manifest.map(async (entry) => {
      const raw = await readFile(
        path.join(
          process.cwd(),
          "public/ai-chat/skill-library",
          entry.slug,
          "SKILL.md",
        ),
        "utf8",
      );
      const [, frontmatter, ...body] = raw.split("---");
      const description =
        frontmatter
          .match(/^description:\s*(.*(?:\n[ \t]+.*)*)/m)?.[1]
          .replace(/\s+/g, " ")
          .trim() ?? "";
      return {
        ...entry,
        name: entry.slug,
        description,
        content: body.join("---").trim(),
      };
    }),
  );
  return <AiSkillLibraryScreen initial={skills} />;
}
