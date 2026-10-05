import { z } from "zod";
export type SkillRevision = {
  version: number;
  name: string;
  description: string;
  content: string;
  savedAt: string;
};
export type LibrarySkill = {
  slug: string;
  name: string;
  description: string;
  content: string;
  origin: string;
  local?: boolean;
  edited?: boolean;
  version?: number;
  uploadedAt?: string;
  fileName?: string;
  fileBytes?: number;
  history?: SkillRevision[];
};
export function skillMarkdown(skill: LibrarySkill) {
  return `---\nname: ${JSON.stringify(skill.name)}\ndescription: ${JSON.stringify(skill.description)}\n---\n\n${skill.content.trim()}\n`;
}
const librarySkillSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
  name: z.string().min(1),
  description: z.string(),
  content: z.string(),
  origin: z.string(),
  local: z.boolean().optional(),
  edited: z.boolean().optional(),
  version: z.number().int().positive().optional(),
  uploadedAt: z.string().optional(),
  fileName: z.string().optional(),
  fileBytes: z.number().nonnegative().optional(),
  history: z
    .array(
      z.object({
        version: z.number().int().positive(),
        name: z.string(),
        description: z.string(),
        content: z.string(),
        savedAt: z.string(),
      }),
    )
    .max(20)
    .optional(),
});
export function isLibrarySkill(value: unknown): value is LibrarySkill {
  return librarySkillSchema.safeParse(value).success;
}

export function reviseSkill(
  current: LibrarySkill,
  patch: Partial<LibrarySkill>,
): LibrarySkill {
  const version = current.version ?? 1;
  const revision = {
    version,
    name: current.name,
    description: current.description,
    content: current.content,
    savedAt: new Date().toISOString(),
  };
  return {
    ...current,
    ...patch,
    version: version + 1,
    history: [revision, ...(current.history ?? [])].slice(0, 20),
    edited: true,
  };
}
export function parseUploadedSkill(markdown: string) {
  const normalized = markdown.replace(/^\uFEFF/, "").replaceAll("\r\n", "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
  if (!match)
    throw new Error(
      "Include YAML frontmatter between --- lines with name and description.",
    );
  function field(key: string) {
    const lines = match![1].split("\n"),
      index = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (index < 0) return "";
    let value = lines[index].slice(key.length + 1).trim();
    if (/^[>|][-+]?$/.test(value)) {
      const block: string[] = [];
      for (
        let i = index + 1;
        i < lines.length && (/^\s/.test(lines[i]) || !lines[i]);
        i++
      )
        block.push(lines[i].trim());
      value = block.join(value.startsWith("|") ? "\n" : " ").trim();
    } else if (value.startsWith('"')) {
      try {
        value = JSON.parse(value);
      } catch {
        throw new Error(`Invalid quoted ${key}.`);
      }
    } else if (value.startsWith("'") && value.endsWith("'"))
      value = value.slice(1, -1).replaceAll("''", "'");
    return value;
  }
  const name = field("name"),
    description = field("description"),
    content = match[2].trim();
  if (!name || !description || !content)
    throw new Error(
      "Name, description, and Markdown instructions are required.",
    );
  if (name.length > 120 || description.length > 4000)
    throw new Error(
      "Name must be under 120 characters and description under 4,000.",
    );
  return { name, description, content };
}
