"use client";

import {
  BadgeCheck,
  Ban,
  Bookmark,
  CalendarRange,
  ChartNoAxesCombined,
  CircleAlert,
  Clock3,
  Command,
  FileInput,
  FolderSearch2,
  FormInput,
  History,
  Inbox,
  ListChecks,
  ListFilter,
  ListOrdered,
  type LucideIcon,
  Megaphone,
  Network,
  PanelRightOpen,
  PanelsTopLeft,
  ScrollText,
  Search,
  ShieldCheck,
  Table2,
  UserRoundPlus,
  UsersRound,
  Webhook,
  Workflow,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { GlideMenu } from "@/components/ai-chat/glide-menu";
import { recordValue } from "@/lib/record-value";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * RECORDS TABLE — an AI spreadsheet grid. Columns are
 * *properties*: click a header to open its configuration
 * popover (type, tool, grounding, inputs, prompt, run), add
 * a new generated property from the + header, and watch cells
 * resolve row-by-row while it updates.
 * ───────────────────────────────────────────────────────── */

type Strength = "strong" | "weak" | "veryweak" | "none";
type SortKey = "name" | "last" | "strength";
type ColumnKey =
  | "company"
  | "categories"
  | "last"
  | "strength"
  | "links"
  | "ai";

const DEFAULT_COLUMN_WIDTHS: Record<ColumnKey, number> = {
  company: 270,
  categories: 275,
  last: 190,
  strength: 210,
  links: 175,
  ai: 240,
};

const STRENGTH: Record<
  Strength,
  { label: string; rank: number; icon: LucideIcon; className: string }
> = {
  strong: {
    label: "Ready",
    rank: 3,
    icon: BadgeCheck,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
  },
  weak: {
    label: "In review",
    rank: 2,
    icon: Clock3,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  },
  veryweak: {
    label: "Needs owner",
    rank: 1,
    icon: UserRoundPlus,
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-200",
  },
  none: {
    label: "Blocked",
    rank: 0,
    icon: Ban,
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
  },
};

const COMPONENT_ICONS = {
  "activity-feed": History,
  "approval-drawer": PanelRightOpen,
  "audit-log": ScrollText,
  "bulk-toolbar": ListChecks,
  "command-menu": Command,
  "data-table": Table2,
  "date-range-picker": CalendarRange,
  "empty-state": Inbox,
  "filter-bar": ListFilter,
  "form-builder": FormInput,
  "import-dialog": FileInput,
  "metric-strip": ChartNoAxesCombined,
  "navigation-tree": Network,
  "permission-matrix": ShieldCheck,
  "release-banner": Megaphone,
  "resource-picker": FolderSearch2,
  "review-panel": PanelsTopLeft,
  "role-selector": UsersRound,
  "run-timeline": Workflow,
  "saved-view-menu": Bookmark,
  "search-field": Search,
  "status-banner": CircleAlert,
  "step-indicator": ListOrdered,
  "webhook-log": Webhook,
} satisfies Record<string, LucideIcon>;

type Row = {
  id: string;
  name: string;
  tags: string[];
  last: string;
  strength: Strength;
  website?: string;
};

const INITIAL_ROWS: Row[] = [
  {
    id: "data-table",
    name: "Data table",
    tags: ["Admin", "Shared"],
    last: "18 minutes ago",
    strength: "weak",
    website: "ui.shadcnblocks.com/components/data-table",
  },
  {
    id: "run-timeline",
    name: "Run timeline",
    tags: ["Automations"],
    last: "42 minutes ago",
    strength: "veryweak",
    website: "ui.shadcnblocks.com/components/run-timeline",
  },
  {
    id: "approval-drawer",
    name: "Approval drawer",
    tags: ["Admin", "Commerce"],
    last: "1 hour ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/approval-drawer",
  },
  {
    id: "command-menu",
    name: "Command menu",
    tags: ["Shared", "Navigation"],
    last: "2 hours ago",
    strength: "weak",
    website: "ui.shadcnblocks.com/components/command-menu",
  },
  {
    id: "bulk-toolbar",
    name: "Bulk toolbar",
    tags: ["Admin"],
    last: "3 hours ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/bulk-toolbar",
  },
  {
    id: "import-dialog",
    name: "Import dialog",
    tags: ["Commerce"],
    last: "5 hours ago",
    strength: "veryweak",
    website: "ui.shadcnblocks.com/components/import-dialog",
  },
  {
    id: "audit-log",
    name: "Audit log",
    tags: ["Security", "Admin"],
    last: "8 hours ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/audit-log",
  },
  {
    id: "filter-bar",
    name: "Filter bar",
    tags: ["Shared", "Admin"],
    last: "1 day ago",
    strength: "veryweak",
    website: "ui.shadcnblocks.com/components/filter-bar",
  },
  {
    id: "release-banner",
    name: "Release banner",
    tags: ["Marketing"],
    last: "1 day ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/release-banner",
  },
  {
    id: "date-range-picker",
    name: "Date range picker",
    tags: ["Commerce", "Admin"],
    last: "2 days ago",
    strength: "weak",
    website: "ui.shadcnblocks.com/components/date-range-picker",
  },
  {
    id: "empty-state",
    name: "Empty state",
    tags: ["Shared"],
    last: "3 days ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/empty-state",
  },
  {
    id: "search-field",
    name: "Search field",
    tags: ["Shared", "Commerce"],
    last: "4 days ago",
    strength: "veryweak",
    website: "ui.shadcnblocks.com/components/search-field",
  },
  {
    id: "activity-feed",
    name: "Activity feed",
    tags: ["Admin", "Security"],
    last: "6 days ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/activity-feed",
  },
  {
    id: "step-indicator",
    name: "Step indicator",
    tags: ["Commerce"],
    last: "1 week ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/step-indicator",
  },
  {
    id: "form-builder",
    name: "Form builder",
    tags: ["Forms", "Admin"],
    last: "1 week ago",
    strength: "weak",
    website: "ui.shadcnblocks.com/components/form-builder",
  },
  {
    id: "navigation-tree",
    name: "Navigation tree",
    tags: ["Navigation", "Shared"],
    last: "9 days ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/navigation-tree",
  },
  {
    id: "permission-matrix",
    name: "Permission matrix",
    tags: ["Security", "Admin"],
    last: "11 days ago",
    strength: "none",
    website: "ui.shadcnblocks.com/components/permission-matrix",
  },
  {
    id: "status-banner",
    name: "Status banner",
    tags: ["Shared"],
    last: "12 days ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/status-banner",
  },
  {
    id: "resource-picker",
    name: "Resource picker",
    tags: ["Commerce", "Shared"],
    last: "14 days ago",
    strength: "weak",
    website: "ui.shadcnblocks.com/components/resource-picker",
  },
  {
    id: "webhook-log",
    name: "Webhook log",
    tags: ["Automations", "Security"],
    last: "16 days ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/webhook-log",
  },
  {
    id: "role-selector",
    name: "Role selector",
    tags: ["Security", "Forms"],
    last: "18 days ago",
    strength: "none",
    website: "ui.shadcnblocks.com/components/role-selector",
  },
  {
    id: "saved-view-menu",
    name: "Saved view menu",
    tags: ["Admin", "Navigation"],
    last: "3 weeks ago",
    strength: "veryweak",
    website: "ui.shadcnblocks.com/components/saved-view-menu",
  },
  {
    id: "metric-strip",
    name: "Metric strip",
    tags: ["Admin", "Marketing"],
    last: "3 weeks ago",
    strength: "strong",
    website: "ui.shadcnblocks.com/components/metric-strip",
  },
  {
    id: "review-panel",
    name: "Review panel",
    tags: ["Admin", "Shared"],
    last: "1 month ago",
    strength: "weak",
    website: "ui.shadcnblocks.com/components/review-panel",
  },
];

/* The generated column resolves to concise release-review notes. */
const AI_LABEL = "Release notes";
const COMPETITOR_POOL = [
  "No blocking changes",
  "Owner confirmation needed",
  "Keyboard review pending",
  "Responsive audit passed",
  "Source contract changed",
  "No open review notes",
  "Release note required",
  "Visual review complete",
];
const releaseNotesFor = (index: number) =>
  `${COMPETITOR_POOL[index % 8]}, ${COMPETITOR_POOL[(index + 3) % 8]}`;

function Icon({
  children,
  size = 14,
  strokeWidth = 1.8,
}: {
  children: React.ReactNode;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* glyph library for property types & tools */
const TYPE_GLYPHS = {
  Text: <path d="M4 6h16M4 12h10M4 18h7" />,
  File: (
    <g>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </g>
  ),
  Collection: (
    <g>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </g>
  ),
  "Single select": (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.4 2.4 4.6-4.9" />
    </g>
  ),
  "Multi select": (
    <g>
      <path d="M11 6h9M11 12h9M11 18h9" />
      <path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17" />
    </g>
  ),
  URL: (
    <g>
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
    </g>
  ),
  Reference: <path d="M7 17 17 7M9 7h8v8" />,
  JSON: (
    <g>
      <path d="M8 4c-2 0-2 2-2 3s.5 3-2 3c2.5 0 2 2 2 3s0 3 2 3" />
      <path d="M16 4c2 0 2 2 2 3s-.5 3 2 3c-2.5 0-2 2-2 3s0 3-2 3" />
    </g>
  ),
  "File splitter": (
    <g>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </g>
  ),
  Date: (
    <g>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </g>
  ),
} satisfies Record<string, React.ReactNode>;

const TOOL_GLYPHS = {
  model: (
    <g>
      <path d="M8 5H5v14h3" />
      <path d="M16 5h3v14h-3" />
      <path d="M11 9h2M11 15h2" />
    </g>
  ),
  web: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a13.5 13.5 0 0 1 3.5 9 13.5 13.5 0 0 1-3.5 9 13.5 13.5 0 0 1-3.5-9A13.5 13.5 0 0 1 12 3z" />
    </g>
  ),
  user: (
    <g>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </g>
  ),
} satisfies Record<string, React.ReactNode>;

/* per-property configuration shown in the popover */
type Prompt = { before: string; chip?: string; after?: string };
type ToolKind = "model" | "web" | "user";
type ColumnMeta = {
  type: string;
  tool: string;
  toolKind: ToolKind;
  inputs?: string;
  prompt?: Prompt;
};

const COLUMN_META = {
  Component: { type: "Text", tool: "User input", toolKind: "user" },
  Surfaces: {
    type: "Multi select",
    tool: "5.6 Sol",
    toolKind: "model",
    inputs: "Component",
    prompt: {
      before: "Tag each ",
      chip: "Component",
      after: " with its product surfaces.",
    },
  },
  "Last changed": { type: "Date", tool: "User input", toolKind: "user" },
  "Release confidence": {
    type: "Single select",
    tool: "5.6 Sol",
    toolKind: "model",
    inputs: "Last changed",
    prompt: {
      before: "Assess release readiness from ",
      chip: "Last changed",
      after: ".",
    },
  },
  Source: {
    type: "URL",
    tool: "Repository",
    toolKind: "web",
    inputs: "Component",
    prompt: { before: "Find the source for ", chip: "Component", after: "." },
  },
  [AI_LABEL]: {
    type: "Text",
    tool: "Repository",
    toolKind: "web",
    inputs: "Component",
    prompt: { before: "Summarize release risks for ", chip: "Component" },
  },
} satisfies Record<string, ColumnMeta>;

const NEW_PROPERTY_TYPES = [
  "Text",
  "File",
  "Collection",
  "Single select",
  "Multi select",
  "URL",
  "Reference",
  "JSON",
  "File splitter",
];
const MODEL_OPTIONS = ["5.6 Sol", "4.1 Pro", "3.2 Mini"];
const INPUT_OPTIONS = [
  "Component",
  "Surfaces",
  "Last changed",
  "Release confidence",
  "Source",
];

function Checkbox({
  checked,
  mixed = false,
  onChange,
  label,
}: {
  checked: boolean;
  mixed?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className="records-checkbox"
      title={label}
      onClick={(event) => event.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <span
        className={`records-checkbox-box ${checked || mixed ? "is-active" : ""}`}
      >
        {mixed ? (
          <span className="records-checkbox-dash" />
        ) : checked ? (
          <Icon size={12}>
            <path d="m5 12 4 4L19 6" />
          </Icon>
        ) : null}
      </span>
    </label>
  );
}

function Tag({ name }: { name: string }) {
  return <span className="records-tag">{name}</span>;
}

function TagList({ tags }: { tags: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const update = () => {
      const available = container.clientWidth;
      const tagWidths = Array.from(
        measure.querySelectorAll<HTMLElement>("[data-tag-measure]"),
        (tag) => tag.offsetWidth,
      );
      const moreWidth =
        measure.querySelector<HTMLElement>("[data-more-measure]")
          ?.offsetWidth ?? 0;
      let used = 0;
      let count = 0;

      for (let index = 0; index < tagWidths.length; index += 1) {
        const nextUsed = used + (count > 0 ? 4 : 0) + tagWidths[index];
        const hiddenAfter = tags.length - (index + 1);
        const totalWithOverflow =
          nextUsed + (hiddenAfter > 0 ? 4 + moreWidth : 0);
        if (totalWithOverflow > available) break;
        used = nextUsed;
        count += 1;
      }

      setVisibleCount(count);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [tags]);

  const hiddenCount = tags.length - visibleCount;

  return (
    <div
      ref={containerRef}
      className="records-tags"
      title={tags.join(", ")}
      aria-label={`Surfaces: ${tags.join(", ")}`}
    >
      <div ref={measureRef} className="records-tags-measure" aria-hidden>
        {tags.map((tag) => (
          <span key={tag} data-tag-measure>
            <Tag name={tag} />
          </span>
        ))}
        <span data-more-measure className="records-more-tag">
          +{tags.length}
        </span>
      </div>
      {tags.slice(0, visibleCount).map((tag) => (
        <Tag key={tag} name={tag} />
      ))}
      {hiddenCount > 0 && (
        <span className="records-more-tag">+{hiddenCount}</span>
      )}
    </div>
  );
}

function CalcCell() {
  return (
    <span className="records-calc">
      <span className="records-muted">Updating…</span>
      <span className="records-pulse" />
    </span>
  );
}

function MiniSwitch({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="relative h-4.5 w-7.5 shrink-0 rounded-full transition-colors duration-150"
      style={{ background: on ? "var(--accent)" : "var(--line-strong)" }}
    >
      <span
        className="absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white shadow-[var(--records-shadow-btn)] transition-transform duration-150"
        style={{
          transform: on ? "translateX(12px)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
        }}
      />
    </button>
  );
}

function HeaderCell({
  label,
  icon,
  sortKey,
  sort,
  onSort,
  onResizeStart,
  resizing = false,
  className = "",
  selected = false,
  onPick,
}: {
  label: string;
  icon: React.ReactNode;
  sortKey?: SortKey;
  sort: { key: SortKey; dir: 1 | -1 };
  onSort: (key: SortKey) => void;
  onResizeStart: (event: React.PointerEvent<HTMLSpanElement>) => void;
  resizing?: boolean;
  className?: string;
  selected?: boolean;
  onPick?: (event: React.MouseEvent) => void;
}) {
  return (
    <th
      className={`records-header-cell ${selected ? "is-colsel" : ""} ${className}`}
    >
      {/* header click opens the property config; the arrow sorts */}
      <button type="button" className="records-header-button" onClick={onPick}>
        <span className="records-header-icon">{icon}</span>
        <span className="truncate">{label}</span>
        {sortKey && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Sort by ${label}`}
            onClick={(event) => {
              event.stopPropagation();
              onSort(sortKey);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onSort(sortKey);
              }
            }}
            className={`records-sort ${sort.key === sortKey ? "is-visible" : ""}`}
            style={{
              transform:
                sort.key === sortKey && sort.dir === -1
                  ? "rotate(180deg)"
                  : undefined,
            }}
          >
            <Icon size={12}>
              <path d="M12 5v14M5 12l7 7 7-7" />
            </Icon>
          </span>
        )}
      </button>
      <span
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${label} column`}
        className={`records-resize-handle ${resizing ? "is-resizing" : ""}`}
        onPointerDown={onResizeStart}
      />
    </th>
  );
}

/* config row inside the property popover */
function ConfigRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-8 items-center justify-between">
      <span className="text-[13px] text-[var(--records-ink-3)]">{label}</span>
      {children}
    </div>
  );
}

function ConfigPicker({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { label: string; icon: React.ReactNode }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div
      role="menu"
      aria-label={label}
      className="absolute top-0 left-full z-30 ml-5 w-[210px] rounded-[12px] bg-[var(--records-surface)] p-1.5 shadow-[var(--records-shadow-overlay)]"
      style={{
        animation: "pop-in 140ms cubic-bezier(0.23,1,0.32,1) both",
        transformOrigin: "top left",
      }}
    >
      <div className="px-2 pt-0.5 pb-1 text-[11.5px] font-medium text-[var(--records-ink-3)]">
        {label}
      </div>
      <GlideMenu className="flex flex-col gap-px">
        {options.map((option) => (
          <button
            key={option.label}
            data-menu-row
            type="button"
            role="menuitemradio"
            aria-checked={selected === option.label}
            onClick={() => onSelect(option.label)}
            className="relative z-10 flex h-8 w-full items-center gap-1.5 rounded-[8px] px-1.5 text-left text-[13px] font-medium text-[var(--records-ink)]"
          >
            <span className="flex size-4 shrink-0 items-center justify-center text-[var(--records-ink-2)]">
              {option.icon}
            </span>
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            <span
              className={
                selected === option.label
                  ? "text-[var(--records-ink)]"
                  : "invisible"
              }
            >
              <Icon size={14} strokeWidth={2.2}>
                <path d="m5 12 4 4L19 6" />
              </Icon>
            </span>
          </button>
        ))}
      </GlideMenu>
    </div>
  );
}

function InputPicker({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div
      role="menu"
      aria-label="Field inputs"
      className="absolute top-0 left-full z-30 ml-5 w-[220px] rounded-[12px] bg-[var(--records-surface)] p-1.5 shadow-[var(--records-shadow-overlay)]"
      style={{
        animation: "pop-in 140ms cubic-bezier(0.23,1,0.32,1) both",
        transformOrigin: "top left",
      }}
    >
      <div className="px-2 pt-0.5 pb-1 text-[11.5px] font-medium text-[var(--records-ink-3)]">
        Use values from
      </div>
      <GlideMenu className="flex flex-col gap-px">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <button
              key={option}
              data-menu-row
              type="button"
              role="menuitemcheckbox"
              aria-checked={checked}
              onClick={() => onToggle(option)}
              className="relative z-10 flex h-8 w-full items-center gap-1.5 rounded-[8px] px-1.5 text-left text-[13px] font-medium text-[var(--records-ink)]"
            >
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded-[5px] border ${checked ? "border-[var(--records-accent)] bg-[var(--records-accent)] text-white" : "border-[var(--records-line-strong)] text-transparent"}`}
              >
                <Icon size={11} strokeWidth={2.4}>
                  <path d="m5 12 4 4L19 6" />
                </Icon>
              </span>
              <span className="min-w-0 flex-1 truncate">{option}</span>
            </button>
          );
        })}
      </GlideMenu>
    </div>
  );
}

export function ComponentRecordsGrid({
  fill = false,
}: {
  fill?: boolean;
  variant?: string;
}) {
  const rows = INITIAL_ROWS;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "name",
    dir: 1,
  });
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [actionColumnWidth, setActionColumnWidth] = useState(100);
  const [columnWidthsLocked, setColumnWidthsLocked] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<ColumnKey | null>(null);
  const initialColumnWidthsRef = useRef<Record<ColumnKey, number> | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  /* property popover, anchored to the clicked header */
  const [prop, setProp] = useState<{
    col: string;
    x: number;
    y: number;
  } | null>(null);
  const [groundingByColumn, setGroundingByColumn] = useState<
    Record<string, boolean>
  >({});
  const grounding = prop ? (groundingByColumn[prop.col] ?? false) : false;
  const setGrounding = (update: (current: boolean) => boolean) => {
    if (prop)
      setGroundingByColumn((current) => ({
        ...current,
        [prop.col]: update(current[prop.col] ?? false),
      }));
  };
  const [groundingHelpOpen, setGroundingHelpOpen] = useState(false);
  const [configMenu, setConfigMenu] = useState<
    "type" | "tool" | "inputs" | null
  >(null);
  const [columnOverrides, setColumnOverrides] = useState<
    Record<string, Partial<ColumnMeta>>
  >({});
  const [inputSelections, setInputSelections] = useState<
    Record<string, string[]>
  >({});
  const [pinnedColumns, setPinnedColumns] = useState<Set<string>>(new Set());
  const [moreSettingsOpen, setMoreSettingsOpen] = useState(false);
  const defaultSettings = {
    required: false,
    allowEmpty: true,
    confidence: false,
  };
  const [settingsByColumn, setSettingsByColumn] = useState<
    Record<string, typeof defaultSettings>
  >({});
  const advancedSettings =
    (prop && settingsByColumn[prop.col]) || defaultSettings;
  const setAdvancedSettings = (
    update: (current: typeof defaultSettings) => typeof defaultSettings,
  ) => {
    if (prop)
      setSettingsByColumn((current) => ({
        ...current,
        [prop.col]: update(current[prop.col] ?? defaultSettings),
      }));
  };
  /* + new-property menu */
  const [addOpen, setAddOpen] = useState<{ x: number; y: number } | null>(null);
  const [tableMenuOpen, setTableMenuOpen] = useState<{
    x: number;
    y: number;
  } | null>(null);
  /* the added AI column and its lifecycle */
  const [addedColumns, setAddedColumns] = useState<string[]>([]);
  const nextColumnId = useRef(0);
  const [doneColumns, setDoneColumns] = useState<string[]>([]);
  const [pendingOpenAi, setPendingOpenAi] = useState<string | null>(null);
  const aiThRef = useRef<HTMLTableCellElement>(null);
  /* programmatic scrolls (revealing the new column) shouldn't close popovers */
  const ignoreScrollRef = useRef(false);
  /* a running calculation resolves rows one by one */
  const [calc, setCalc] = useState<{ col: string; resolved: number } | null>(
    null,
  );

  /* Let the table fill its available space once, then capture those rendered
   * widths before paint. From that point on every column is explicit, so a
   * resize changes only the dragged column and the table's total width. */
  useLayoutEffect(() => {
    if (columnWidthsLocked || !tableRef.current) return;
    const headers = Array.from(
      tableRef.current.querySelectorAll<HTMLTableCellElement>("thead th"),
    );
    if (headers.length < 6) return;

    const measured: Record<ColumnKey, number> = {
      company: headers[0].getBoundingClientRect().width,
      categories: headers[1].getBoundingClientRect().width,
      last: headers[2].getBoundingClientRect().width,
      strength: headers[3].getBoundingClientRect().width,
      links: headers[4].getBoundingClientRect().width,
      ai: DEFAULT_COLUMN_WIDTHS.ai,
    };
    initialColumnWidthsRef.current = measured;
    setColumnWidths(measured);
    setActionColumnWidth(
      headers[headers.length - 1].getBoundingClientRect().width,
    );
    setColumnWidthsLocked(true);
  }, [columnWidthsLocked]);

  function relativeMinutes(value: string) {
    const amount = Number.parseFloat(value);
    if (!Number.isFinite(amount)) return Number.MAX_SAFE_INTEGER;
    return (
      amount *
      (value.includes("minute")
        ? 1
        : value.includes("hour")
          ? 60
          : value.includes("day")
            ? 1440
            : value.includes("week")
              ? 10080
              : value.includes("month")
                ? 43200
                : 525600)
    );
  }
  const visibleRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const value =
        sort.key === "name"
          ? a.name.localeCompare(b.name)
          : sort.key === "last"
            ? relativeMinutes(a.last) - relativeMinutes(b.last)
            : STRENGTH[a.strength].rank - STRENGTH[b.strength].rank;
      return value * sort.dir;
    });
  }, [rows, sort]);

  /* stagger: one row resolves every beat */
  useEffect(() => {
    if (!calc) return;
    if (calc.resolved > visibleRows.length) {
      if (addedColumns.includes(calc.col))
        setDoneColumns((current) => [...current, calc.col]);
      setCalc(null);
      return;
    }
    const t = setTimeout(
      () =>
        setCalc((current) =>
          current ? { ...current, resolved: current.resolved + 1 } : current,
        ),
      110,
    );
    return () => clearTimeout(t);
  }, [calc, visibleRows.length, addedColumns]);

  /* after adding the AI column, scroll it into view and open its config
   * anchored to the new header */
  useEffect(() => {
    if (!pendingOpenAi || !aiThRef.current) return;
    const scroller = aiThRef.current.closest(".records-scroll");
    if (scroller) {
      ignoreScrollRef.current = true;
      scroller.scrollLeft = scroller.scrollWidth;
    }
    const rect = aiThRef.current.getBoundingClientRect();
    setProp({
      col: pendingOpenAi,
      x: Math.min(rect.left, window.innerWidth - 336),
      y: rect.bottom + 6,
    });
    setPendingOpenAi(null);
  }, [pendingOpenAi, addedColumns]);

  /* click anywhere else closes popovers */
  useEffect(() => {
    if (!prop && !addOpen && !tableMenuOpen) return;
    const close = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest("[data-recpop]")) {
        setProp(null);
        setConfigMenu(null);
        setGroundingHelpOpen(false);
        setMoreSettingsOpen(false);
        setAddOpen(null);
        setTableMenuOpen(null);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [prop, addOpen, tableMenuOpen]);

  const openProp = (col: string) => (event: React.MouseEvent) => {
    const th = event.currentTarget.closest("th");
    if (!th) return;
    setAddOpen(null);
    setTableMenuOpen(null);
    setConfigMenu(null);
    setGroundingHelpOpen(false);
    setMoreSettingsOpen(false);
    setProp((current) => {
      if (current?.col === col) return null;
      const rect = th.getBoundingClientRect();
      return {
        col,
        x: Math.min(rect.left, window.innerWidth - 336),
        y: rect.bottom + 6,
      };
    });
  };

  const isCalc = (col: string, index: number) =>
    !!calc && calc.col === col && index >= calc.resolved;

  const allSelected =
    visibleRows.length > 0 && visibleRows.every((row) => selected.has(row.id));
  const partiallySelected =
    !allSelected && visibleRows.some((row) => selected.has(row.id));

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 1 ? -1 : 1 }
        : { key, dir: 1 },
    );
  const startColumnResize =
    (key: ColumnKey, minWidth = 120) =>
    (event: React.PointerEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setProp(null);
      setConfigMenu(null);
      setGroundingHelpOpen(false);
      setMoreSettingsOpen(false);
      setAddOpen(null);
      setTableMenuOpen(null);

      const startX = event.clientX;
      const startWidth = columnWidths[key];
      const previousCursor = document.body.style.cursor;
      const previousSelection = document.body.style.userSelect;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      setResizingColumn(key);

      const move = (moveEvent: PointerEvent) => {
        const width = Math.max(
          minWidth,
          startWidth + moveEvent.clientX - startX,
        );
        setColumnWidths((current) => ({ ...current, [key]: width }));
      };
      const finish = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousSelection;
        setResizingColumn(null);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    };
  const toggleRow = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((current) => {
      const next = new Set(current);
      if (allSelected) visibleRows.forEach((row) => next.delete(row.id));
      else visibleRows.forEach((row) => next.add(row.id));
      return next;
    });

  const meta: ColumnMeta | null = prop
    ? {
        ...(recordValue(COLUMN_META, prop.col) ?? COLUMN_META.Component),
        ...columnOverrides[prop.col],
      }
    : null;
  const selectedInputs =
    prop && meta
      ? (inputSelections[prop.col] ?? (meta.inputs ? [meta.inputs] : []))
      : [];
  const tableWidth =
    columnWidths.company +
    columnWidths.categories +
    columnWidths.last +
    columnWidths.strength +
    columnWidths.links +
    addedColumns.length * columnWidths.ai +
    actionColumnWidth;

  return (
    <div
      data-component-records-grid
      className={fill ? "records-shell is-fill" : "records-shell"}
    >
      <div
        className="records-scroll"
        tabIndex={0}
        aria-label="Components table. Scroll horizontally and vertically to view all columns and records."
        onScroll={() => {
          if (ignoreScrollRef.current) {
            ignoreScrollRef.current = false;
            return;
          }
          setProp(null);
          setConfigMenu(null);
          setGroundingHelpOpen(false);
          setMoreSettingsOpen(false);
          setAddOpen(null);
          setTableMenuOpen(null);
        }}
      >
        <table
          ref={tableRef}
          className="records-table"
          style={{
            width: columnWidthsLocked ? tableWidth : "100%",
            minWidth: tableWidth,
          }}
        >
          <colgroup>
            <col
              className="records-company-col"
              style={{ width: columnWidths.company }}
            />
            <col
              className="records-category-col"
              style={{ width: columnWidths.categories }}
            />
            <col
              className="records-last-col"
              style={{ width: columnWidths.last }}
            />
            <col
              className="records-strength-col"
              style={{ width: columnWidths.strength }}
            />
            <col
              className="records-link-col"
              style={{ width: columnWidths.links }}
            />
            {addedColumns.map((col) => (
              <col key={col} style={{ width: columnWidths.ai }} />
            ))}
            <col style={{ width: 100 }} />
          </colgroup>
          <thead>
            <tr>
              <th
                className={`records-header-cell records-sticky-cell ${prop?.col === "Component" ? "is-colsel" : ""}`}
              >
                <div
                  className="records-company-header"
                  style={{ cursor: "pointer" }}
                  onClick={(event) => openProp("Component")(event)}
                >
                  <Checkbox
                    checked={allSelected}
                    mixed={partiallySelected}
                    onChange={toggleAll}
                    label="Select all components"
                  />
                  <span>Component</span>
                </div>
                <span
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize Component column"
                  className={`records-resize-handle ${resizingColumn === "company" ? "is-resizing" : ""}`}
                  onPointerDown={startColumnResize("company", 180)}
                />
              </th>
              <HeaderCell
                label="Surfaces"
                selected={prop?.col === "Surfaces"}
                onPick={openProp("Surfaces")}
                sort={sort}
                onSort={toggleSort}
                onResizeStart={startColumnResize("categories")}
                resizing={resizingColumn === "categories"}
                icon={<Icon size={15}>{TYPE_GLYPHS["Multi select"]}</Icon>}
              />
              <HeaderCell
                label="Last changed"
                selected={prop?.col === "Last changed"}
                onPick={openProp("Last changed")}
                sortKey="last"
                sort={sort}
                onSort={toggleSort}
                onResizeStart={startColumnResize("last")}
                resizing={resizingColumn === "last"}
                icon={<Icon size={15}>{TYPE_GLYPHS.Date}</Icon>}
              />
              <HeaderCell
                label="Release confidence"
                selected={prop?.col === "Release confidence"}
                onPick={openProp("Release confidence")}
                sortKey="strength"
                sort={sort}
                onSort={toggleSort}
                onResizeStart={startColumnResize("strength")}
                resizing={resizingColumn === "strength"}
                icon={<Icon size={15}>{TYPE_GLYPHS["Single select"]}</Icon>}
              />
              <HeaderCell
                label="Source"
                selected={prop?.col === "Source"}
                onPick={openProp("Source")}
                sort={sort}
                onSort={toggleSort}
                onResizeStart={startColumnResize("links")}
                resizing={resizingColumn === "links"}
                icon={<Icon size={15}>{TYPE_GLYPHS.URL}</Icon>}
              />
              {addedColumns.map((col) => (
                <th
                  key={col}
                  ref={col === pendingOpenAi ? aiThRef : undefined}
                  className={`records-header-cell ${prop?.col === col ? "is-colsel" : ""}`}
                >
                  <button
                    type="button"
                    className="records-header-button"
                    onClick={openProp(col)}
                  >
                    <span className="records-header-icon">
                      <Icon size={15}>
                        {recordValue(
                          TYPE_GLYPHS,
                          columnOverrides[col]?.type ?? "Text",
                        )}
                      </Icon>
                    </span>
                    <span className="truncate">{col}</span>
                  </button>
                  <span
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Resize ${col} column`}
                    className={`records-resize-handle ${resizingColumn === "ai" ? "is-resizing" : ""}`}
                    onPointerDown={startColumnResize("ai")}
                  />
                </th>
              ))}
              <th className="records-header-cell">
                <div className="flex h-[35px] items-center gap-1 px-2">
                  <button
                    type="button"
                    aria-label="New property"
                    data-recpop
                    onClick={(event) => {
                      setProp(null);
                      setTableMenuOpen(null);
                      const rect = event.currentTarget.getBoundingClientRect();
                      setAddOpen((current) =>
                        current
                          ? null
                          : {
                              x: Math.min(rect.left, window.innerWidth - 276),
                              y: rect.bottom + 6,
                            },
                      );
                    }}
                    className="flex size-7 items-center justify-center rounded-[7px] text-[var(--records-ink-2)] transition-colors duration-100 hover:bg-[var(--records-hover)] hover:text-[var(--records-ink)]"
                  >
                    <Icon size={15} strokeWidth={2}>
                      <path d="M12 5v14M5 12h14" />
                    </Icon>
                  </button>
                  <button
                    type="button"
                    aria-label="Table options"
                    aria-expanded={!!tableMenuOpen}
                    data-recpop
                    onClick={(event) => {
                      setProp(null);
                      setAddOpen(null);
                      const rect = event.currentTarget.getBoundingClientRect();
                      setTableMenuOpen((current) =>
                        current
                          ? null
                          : {
                              x: Math.max(
                                8,
                                Math.min(
                                  rect.right - 220,
                                  window.innerWidth - 228,
                                ),
                              ),
                              y: rect.bottom + 6,
                            },
                      );
                    }}
                    className="flex size-7 items-center justify-center rounded-[7px] text-[var(--records-ink-3)] transition-colors duration-100 hover:bg-[var(--records-hover)] hover:text-[var(--records-ink)]"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <circle cx="5" cy="12" r="1.6" />
                      <circle cx="12" cy="12" r="1.6" />
                      <circle cx="19" cy="12" r="1.6" />
                    </svg>
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          {/* data cells stay silent — the papery link/flick sound is too much when scanning rows */}
          <tbody>
            {visibleRows.map((row, index) => {
              const selectedRow = selected.has(row.id);
              const strength = STRENGTH[row.strength];
              const ComponentIcon =
                recordValue(COMPONENT_ICONS, row.id) ?? PanelsTopLeft;
              const StatusIcon = strength.icon;
              return (
                <tr
                  key={row.id}
                  className={`records-row ${selectedRow ? "is-selected" : ""}`}
                >
                  <td
                    className={`records-cell records-sticky-cell records-company-cell ${prop?.col === "Component" ? "is-colsel" : ""}`}
                  >
                    <span className="records-rownum">{index + 1}</span>
                    <Checkbox
                      checked={selectedRow}
                      onChange={() => toggleRow(row.id)}
                      label={`Select ${row.name}`}
                    />
                    <span className="records-component-icon" aria-hidden="true">
                      <ComponentIcon size={15} strokeWidth={1.8} />
                    </span>
                    <a
                      href={row.website ? `https://${row.website}` : "#"}
                      onClick={(event) =>
                        !row.website && event.preventDefault()
                      }
                      title={row.name}
                      className={`records-company-name ${row.website ? "has-link" : ""}`}
                    >
                      {row.name}
                    </a>
                  </td>
                  <td
                    className={`records-cell ${prop?.col === "Surfaces" ? "is-colsel" : ""}`}
                  >
                    {isCalc("Surfaces", index) ? (
                      <CalcCell />
                    ) : (
                      <TagList tags={row.tags} />
                    )}
                  </td>
                  <td
                    className={`records-cell ${row.last === "No contact" ? "records-muted" : ""} ${prop?.col === "Last changed" ? "is-colsel" : ""}`}
                  >
                    {isCalc("Last changed", index) ? <CalcCell /> : row.last}
                  </td>
                  <td
                    className={`records-cell ${prop?.col === "Release confidence" ? "is-colsel" : ""}`}
                  >
                    {isCalc("Release confidence", index) ? (
                      <CalcCell />
                    ) : (
                      <span
                        className={cn("records-status", strength.className)}
                      >
                        <StatusIcon
                          size={13}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        {strength.label}
                      </span>
                    )}
                  </td>
                  <td
                    className={`records-cell ${prop?.col === "Source" ? "is-colsel" : ""}`}
                  >
                    {isCalc("Source", index) ? (
                      <CalcCell />
                    ) : row.website ? (
                      <a
                        className="records-link"
                        href={`https://${row.website}`}
                        title={row.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="records-link-label">
                          {row.website}
                        </span>
                        <Icon size={12}>
                          <path d="M14 5h5v5M19 5l-8 8" />
                        </Icon>
                      </a>
                    ) : (
                      <span className="records-muted">—</span>
                    )}
                  </td>
                  {addedColumns.map((col) => (
                    <td
                      key={col}
                      className={`records-cell ${prop?.col === col ? "is-colsel" : ""}`}
                    >
                      {calc?.col === col ? (
                        index < calc.resolved ? (
                          columnOverrides[col]?.type === "Text" ? (
                            releaseNotesFor(index)
                          ) : (
                            <span className="records-muted">—</span>
                          )
                        ) : (
                          <CalcCell />
                        )
                      ) : doneColumns.includes(col) ? (
                        columnOverrides[col]?.type === "Text" ? (
                          releaseNotesFor(index)
                        ) : (
                          <span className="records-muted">—</span>
                        )
                      ) : (
                        <span className="records-muted">—</span>
                      )}
                    </td>
                  ))}
                  <td className="records-cell" />
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="records-summary-row">
              <td className="records-cell records-sticky-cell">
                <span className="records-footer-value">
                  <strong>{rows.length}</strong>&nbsp;components
                </span>
              </td>
              <td className="records-cell">
                <span className="records-footer-value">
                  {new Set(rows.flatMap((row) => row.tags)).size} surfaces
                </span>
              </td>
              <td className="records-cell">
                <span className="records-footer-value">
                  {
                    rows.filter(
                      (row) =>
                        row.last.includes("minute") ||
                        row.last.includes("hour"),
                    ).length
                  }{" "}
                  changed today
                </span>
              </td>
              <td className="records-cell">
                <span className="records-footer-value records-ready-summary">
                  <BadgeCheck size={13} strokeWidth={2} aria-hidden="true" />
                  {rows.filter((row) => row.strength === "strong").length} ready
                </span>
              </td>
              <td className="records-cell">
                <span className="records-footer-value">
                  {rows.filter((row) => row.website).length} linked
                </span>
              </td>
              {addedColumns.map((col) => (
                <td key={col} className="records-cell records-muted">
                  <span className="records-footer-value">
                    {doneColumns.includes(col)
                      ? `${rows.length} notes`
                      : "Not generated"}
                  </span>
                </td>
              ))}
              <td className="records-cell" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── property configuration popover ─────────────────── */}
      {prop && meta && (
        <div
          data-recpop
          className="fixed z-50 w-[320px] rounded-[14px] bg-[var(--records-surface)] px-3 pt-3 pb-1.5 shadow-[var(--records-shadow-overlay)]"
          style={{
            top: prop.y,
            left: prop.x,
            animation: "pop-in 160ms cubic-bezier(0.23,1,0.32,1) both",
            transformOrigin: "top left",
          }}
        >
          <div className="pb-2 text-[13.5px] font-medium text-[var(--records-ink)]">
            {prop.col}
          </div>

          <ConfigRow label="Type">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={configMenu === "type"}
              onClick={() =>
                setConfigMenu((current) => (current === "type" ? null : "type"))
              }
              className="flex items-center gap-1.5 rounded-[6px] px-1.5 py-1 text-[13px] font-medium text-[var(--records-ink)] transition-colors duration-100 hover:bg-[var(--records-hover)]"
            >
              <span className="text-[var(--records-ink-2)]">
                <Icon size={14}>
                  {recordValue(TYPE_GLYPHS, meta.type) ?? TYPE_GLYPHS.Text}
                </Icon>
              </span>
              {meta.type}
              <span className="text-[var(--records-ink-3)]">
                <Icon size={12} strokeWidth={2.2}>
                  <path d="M9 6l6 6-6 6" />
                </Icon>
              </span>
            </button>
            {configMenu === "type" && (
              <ConfigPicker
                label="Property type"
                selected={meta.type}
                options={NEW_PROPERTY_TYPES.map((type) => ({
                  label: type,
                  icon: <Icon size={15}>{recordValue(TYPE_GLYPHS, type)}</Icon>,
                }))}
                onSelect={(type) => {
                  setColumnOverrides((current) => ({
                    ...current,
                    [prop.col]: { ...current[prop.col], type },
                  }));
                  setConfigMenu(null);
                }}
              />
            )}
          </ConfigRow>
          <ConfigRow label="Tool">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={configMenu === "tool"}
              onClick={() =>
                setConfigMenu((current) => (current === "tool" ? null : "tool"))
              }
              className="flex items-center gap-1.5 rounded-[6px] px-1.5 py-1 text-[13px] font-medium text-[var(--records-ink)] transition-colors duration-100 hover:bg-[var(--records-hover)]"
            >
              <span
                className={
                  meta.toolKind === "model"
                    ? "text-[var(--records-accent)]"
                    : "text-[var(--records-ink-2)]"
                }
              >
                {meta.toolKind === "model" ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    {TOOL_GLYPHS.model}
                  </svg>
                ) : (
                  <Icon size={14}>
                    {recordValue(TOOL_GLYPHS, meta.toolKind)}
                  </Icon>
                )}
              </span>
              {meta.tool}
              <span className="text-[var(--records-ink-3)]">
                <Icon size={12} strokeWidth={2.2}>
                  <path d="M9 6l6 6-6 6" />
                </Icon>
              </span>
            </button>
            {configMenu === "tool" && (
              <ConfigPicker
                label="Model"
                selected={meta.tool}
                options={MODEL_OPTIONS.map((model) => ({
                  label: model,
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      {TOOL_GLYPHS.model}
                    </svg>
                  ),
                }))}
                onSelect={(tool) => {
                  setColumnOverrides((current) => ({
                    ...current,
                    [prop.col]: {
                      ...current[prop.col],
                      tool,
                      toolKind: "model",
                    },
                  }));
                  setConfigMenu(null);
                }}
              />
            )}
          </ConfigRow>
          <ConfigRow label="Grounding">
            <span className="flex items-center gap-2">
              <MiniSwitch
                label="Grounding"
                on={grounding}
                onToggle={() => setGrounding((current) => !current)}
              />
              <button
                type="button"
                aria-label="About grounding"
                aria-expanded={groundingHelpOpen}
                onClick={() => setGroundingHelpOpen((open) => !open)}
                className="flex size-6 items-center justify-center rounded-[6px] text-[var(--records-ink-3)] transition-colors duration-100 hover:bg-[var(--records-hover)] hover:text-[var(--records-ink)]"
              >
                <Icon size={13}>
                  <g>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8h.01M11 12h1v4h1" />
                  </g>
                </Icon>
              </button>
            </span>
            {groundingHelpOpen && (
              <div
                className="absolute top-[30px] right-0 z-30 w-[230px] rounded-[10px] px-3 py-2.5 text-[12px] leading-relaxed shadow-[var(--records-shadow-overlay)]"
                style={{
                  color: "var(--tooltip-fg)",
                  background: "var(--tooltip-bg)",
                }}
                role="status"
              >
                Grounding lets the model verify generated values against
                connected sources.
              </div>
            )}
          </ConfigRow>
          <ConfigRow label="Inputs">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={configMenu === "inputs"}
              onClick={() =>
                setConfigMenu((current) =>
                  current === "inputs" ? null : "inputs",
                )
              }
              className="flex max-w-[220px] items-center gap-1.5 rounded-[6px] px-1.5 py-1 text-[13px] text-[var(--records-ink-2)] transition-colors duration-100 hover:bg-[var(--records-hover)] hover:text-[var(--records-ink)]"
            >
              {selectedInputs.length ? (
                <span className="flex min-w-0 items-center gap-1">
                  {selectedInputs.slice(0, 2).map((input) => (
                    <span
                      key={input}
                      className="max-w-[92px] truncate rounded-[5px] bg-[var(--records-accent-tint)] px-1.5 py-0.5 text-[12px] font-medium text-[var(--records-accent-ink)]"
                    >
                      {input}
                    </span>
                  ))}
                  {selectedInputs.length > 2 && (
                    <span className="text-[11px] font-medium text-[var(--records-ink-3)]">
                      +{selectedInputs.length - 2}
                    </span>
                  )}
                </span>
              ) : (
                <span>Select inputs</span>
              )}
              <span className="shrink-0 text-[var(--records-ink-3)]">
                <Icon size={12} strokeWidth={2.2}>
                  <path d="M9 6l6 6-6 6" />
                </Icon>
              </span>
            </button>
            {configMenu === "inputs" && (
              <InputPicker
                selected={selectedInputs}
                options={INPUT_OPTIONS.filter((input) => input !== prop.col)}
                onToggle={(input) => {
                  setInputSelections((current) => {
                    const existing =
                      current[prop.col] ?? (meta.inputs ? [meta.inputs] : []);
                    const next = existing.includes(input)
                      ? existing.filter((item) => item !== input)
                      : [...existing, input];
                    return { ...current, [prop.col]: next };
                  });
                }}
              />
            )}
          </ConfigRow>

          {/* prompt — @-mention chips inline */}
          <div
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label={`${prop.col} update prompt`}
            aria-multiline="true"
            spellCheck
            className="mt-2 min-h-[88px] cursor-text rounded-[10px] bg-[var(--records-inset)] p-3 text-[13px] leading-relaxed shadow-[var(--records-shadow-hairline)] transition-[box-shadow] duration-150 outline-none focus:shadow-[0_0_0_2px_var(--accent)]"
          >
            {meta.prompt ? (
              <span className="text-[var(--records-ink)]">
                {meta.prompt.before}
                {meta.prompt.chip && (
                  <span
                    contentEditable={false}
                    className="rounded-[5px] bg-[var(--records-accent-tint)] px-1.5 py-0.5 text-[12px] font-medium text-[var(--records-accent-ink)]"
                  >
                    {meta.prompt.chip}
                  </span>
                )}
                {meta.prompt.after}
              </span>
            ) : (
              <span className="text-[var(--records-ink-3)]">
                Set a prompt (press @ to mention an input)
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!!calc}
            onClick={() => {
              setCalc({ col: prop.col, resolved: 0 });
              setProp(null);
            }}
            className="mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-[9px] text-[12.5px] font-medium text-[var(--records-ink)] shadow-[var(--records-shadow-btn)] transition-[background-color,transform] duration-150 hover:bg-[var(--records-hover)] active:scale-[0.98] disabled:opacity-60"
          >
            <Icon size={14} strokeWidth={1.9}>
              <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
            </Icon>
            Update values
          </button>

          <GlideMenu
            className="mt-3 flex flex-col gap-0.5 border-t border-[var(--records-line)] pt-2"
            highlightClassName="-inset-x-1.5 rounded-[8px] bg-[var(--records-hover)]"
          >
            <button
              data-menu-row
              type="button"
              aria-pressed={pinnedColumns.has(prop.col)}
              onClick={() =>
                setPinnedColumns((current) => {
                  const next = new Set(current);
                  if (next.has(prop.col)) next.delete(prop.col);
                  else next.add(prop.col);
                  return next;
                })
              }
              className="relative z-10 -mx-1.5 flex h-8 items-center gap-2.5 rounded-[8px] px-1.5 text-left text-[13px] leading-none text-[var(--records-ink)] transition-transform duration-150 active:scale-[0.96]"
            >
              <span
                className={
                  pinnedColumns.has(prop.col)
                    ? "text-[var(--records-accent)]"
                    : "text-[var(--records-ink-2)]"
                }
              >
                <Icon size={15}>
                  <path d="M12 17v5M8 3h8l-1 7 3 3H6l3-3-1-7z" />
                </Icon>
              </span>
              {pinnedColumns.has(prop.col) ? "Unpin" : "Pin"}
            </button>
            <button
              data-menu-row
              type="button"
              aria-expanded={moreSettingsOpen}
              onClick={() => setMoreSettingsOpen((open) => !open)}
              className="relative z-10 -mx-1.5 flex h-8 items-center gap-2.5 rounded-[8px] px-1.5 text-left text-[13px] leading-none text-[var(--records-ink)] transition-transform duration-150 active:scale-[0.96]"
            >
              <span
                className={
                  moreSettingsOpen
                    ? "text-[var(--records-ink)]"
                    : "text-[var(--records-ink-2)]"
                }
              >
                <Icon size={15}>
                  <g>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
                  </g>
                </Icon>
              </span>
              <span className="flex-1">More settings</span>
              <span
                className={`text-[var(--records-ink-3)] transition-transform duration-150 ${moreSettingsOpen ? "rotate-90" : ""}`}
              >
                <Icon size={12} strokeWidth={2.2}>
                  <path d="M9 6l6 6-6 6" />
                </Icon>
              </span>
            </button>
            {addedColumns.includes(prop.col) && (
              <button
                data-menu-row
                type="button"
                onClick={() => {
                  setAddedColumns((current) =>
                    current.filter((col) => col !== prop.col),
                  );
                  setDoneColumns((current) =>
                    current.filter((col) => col !== prop.col),
                  );
                  setProp(null);
                }}
                className="relative z-10 -mx-1.5 flex h-8 items-center gap-2.5 rounded-[8px] px-1.5 text-left text-[13px] leading-none text-[var(--records-ink)] transition-transform duration-150 active:scale-[0.96]"
              >
                <span className="text-[var(--records-ink-2)]">
                  <Icon size={15}>
                    <g>
                      <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c7 0 10 7 10 7a16.3 16.3 0 0 1-2.1 3M6.6 6.6A16 16 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.4-1.6M3 3l18 18" />
                      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    </g>
                  </Icon>
                </span>
                Hide from view
              </button>
            )}
          </GlideMenu>

          {moreSettingsOpen && (
            <div
              className="mt-2 border-t border-[var(--records-line)] pt-2"
              style={{
                animation: "fade-up 160ms cubic-bezier(0.23,1,0.32,1) both",
              }}
            >
              <div className="pb-1 text-[11.5px] font-medium text-[var(--records-ink-3)]">
                Behavior
              </div>
              <ConfigRow label="Required value">
                <MiniSwitch
                  label="Required value"
                  on={advancedSettings.required}
                  onToggle={() =>
                    setAdvancedSettings((current) => ({
                      ...current,
                      required: !current.required,
                    }))
                  }
                />
              </ConfigRow>
              <ConfigRow label="Allow empty results">
                <MiniSwitch
                  label="Allow empty results"
                  on={advancedSettings.allowEmpty}
                  onToggle={() =>
                    setAdvancedSettings((current) => ({
                      ...current,
                      allowEmpty: !current.allowEmpty,
                    }))
                  }
                />
              </ConfigRow>
              <ConfigRow label="Show confidence">
                <MiniSwitch
                  label="Show confidence"
                  on={advancedSettings.confidence}
                  onToggle={() =>
                    setAdvancedSettings((current) => ({
                      ...current,
                      confidence: !current.confidence,
                    }))
                  }
                />
              </ConfigRow>
            </div>
          )}
        </div>
      )}

      {/* ── new property type menu ─────────────────────────── */}
      {addOpen && (
        <div
          data-recpop
          className="fixed z-50 w-[260px] rounded-[14px] bg-[var(--records-surface)] p-1.5 shadow-[var(--records-shadow-overlay)]"
          style={{
            top: addOpen.y,
            left: addOpen.x,
            animation: "pop-in 160ms cubic-bezier(0.23,1,0.32,1) both",
            transformOrigin: "top left",
          }}
        >
          <div className="px-2 pt-1 pb-1 text-[12px] font-medium text-[var(--records-ink-3)]">
            New property
          </div>
          <GlideMenu className="flex flex-col gap-px">
            {NEW_PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                data-menu-row
                type="button"
                onClick={() => {
                  setAddOpen(null);
                  const col = `${type} ${++nextColumnId.current}`;
                  setColumnOverrides((current) => ({
                    ...current,
                    [col]: { type, tool: "User input", toolKind: "user" },
                  }));
                  setAddedColumns((current) => [...current, col]);
                  setPendingOpenAi(col);
                }}
                className="relative z-10 flex h-9 w-full items-center gap-2.5 rounded-[8px] px-2 text-left text-[13px] text-[var(--records-ink)]"
              >
                <span className="text-[var(--records-ink-2)]">
                  <Icon size={15}>{recordValue(TYPE_GLYPHS, type)}</Icon>
                </span>
                {type}
              </button>
            ))}
          </GlideMenu>
        </div>
      )}

      {/* ── table options menu ─────────────────────────────── */}
      {tableMenuOpen && (
        <div
          data-recpop
          className="fixed z-50 w-[220px] rounded-[14px] bg-[var(--records-surface)] p-1.5 shadow-[var(--records-shadow-overlay)]"
          style={{
            top: tableMenuOpen.y,
            left: tableMenuOpen.x,
            animation: "pop-in 160ms cubic-bezier(0.23,1,0.32,1) both",
            transformOrigin: "top right",
          }}
        >
          <div className="px-2 pt-1 pb-1 text-[12px] font-medium text-[var(--records-ink-3)]">
            Table options
          </div>
          <GlideMenu className="flex flex-col gap-px">
            <button
              data-menu-row
              type="button"
              onClick={() => {
                const position = tableMenuOpen;
                setTableMenuOpen(null);
                setAddOpen({
                  x: Math.min(position.x, window.innerWidth - 276),
                  y: position.y,
                });
              }}
              className="relative z-10 flex h-9 w-full items-center gap-2.5 rounded-[8px] px-2 text-left text-[13px] text-[var(--records-ink)]"
            >
              <span className="text-[var(--records-ink-2)]">
                <Icon size={15} strokeWidth={2}>
                  <path d="M12 5v14M5 12h14" />
                </Icon>
              </span>
              Add property
            </button>
            <button
              data-menu-row
              type="button"
              onClick={() => {
                setColumnWidths({
                  company: 220,
                  categories: 220,
                  last: 155,
                  strength: 180,
                  links: 160,
                  ai: 200,
                });
                setTableMenuOpen(null);
              }}
              className="relative z-10 flex h-9 w-full items-center gap-2.5 rounded-[8px] px-2 text-left text-[13px] text-[var(--records-ink)]"
            >
              <span className="text-[var(--records-ink-2)]">
                <Icon size={15}>
                  <path d="M4 8h16M7 4 3 8l4 4M17 4l4 4-4 4M4 16h16" />
                </Icon>
              </span>
              Compact columns
            </button>
            <button
              data-menu-row
              type="button"
              onClick={() => {
                setColumnWidths({
                  ...(initialColumnWidthsRef.current ?? DEFAULT_COLUMN_WIDTHS),
                });
                setTableMenuOpen(null);
              }}
              className="relative z-10 flex h-9 w-full items-center gap-2.5 rounded-[8px] px-2 text-left text-[13px] text-[var(--records-ink)]"
            >
              <span className="text-[var(--records-ink-2)]">
                <Icon size={15}>
                  <path d="M3 12a9 9 0 1 0 3-6.7M3 4v6h6" />
                </Icon>
              </span>
              Reset column widths
            </button>
            <div className="my-1 h-px bg-[var(--records-line)]" />
            <button
              data-menu-row
              type="button"
              onClick={() => {
                setSelected(new Set());
                setTableMenuOpen(null);
              }}
              className="relative z-10 flex h-9 w-full items-center gap-2.5 rounded-[8px] px-2 text-left text-[13px] text-[var(--records-ink)]"
            >
              <span className="text-[var(--records-ink-2)]">
                <Icon size={15}>
                  <path d="M5 5l14 14M19 5 5 19" />
                </Icon>
              </span>
              Clear selection
            </button>
          </GlideMenu>
        </div>
      )}
    </div>
  );
}
