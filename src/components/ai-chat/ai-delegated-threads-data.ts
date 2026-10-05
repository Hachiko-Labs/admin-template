import type { AiChatMessageData } from "@/components/ai-chat/ai-chat-message";

export type ChildStatus = "running" | "completed" | "cancelled";
export interface ChildControl {
  id: string;
  kind: "steer" | "queue" | "cancel";
  text: string;
  status: "applied" | "queued" | "withdrawn";
}
export interface ChildActivity {
  id: string;
  title: string;
  detail: string;
  complete: boolean;
}
export interface DelegatedChild {
  id: string;
  name: string;
  role: string;
  task: string;
  status: ChildStatus;
  result: string;
  messages: AiChatMessageData[];
  activity: ChildActivity[];
  controls: ChildControl[];
}
export const childMessage = (
  id: string,
  role: "user" | "assistant",
  text: string,
): AiChatMessageData => ({ id, role, parts: [{ type: "text", text }] });
export const initialDelegatedChildren: DelegatedChild[] = [
  {
    id: "data",
    name: "Data analyst",
    role: "Input validation",
    task: "Review CSV parsing, required fields, and duplicate handling. Recommend a recovery path for invalid rows.",
    status: "running",
    result:
      "Validate the file before importing. Show a row-level error report, keep valid rows available, and let the user download only the rows that need fixing. Flag duplicates before any records are created.",
    messages: [
      childMessage(
        "data-parent",
        "user",
        "Review CSV parsing, required fields, and duplicate handling. Recommend a recovery path for invalid rows.",
      ),
      childMessage(
        "data-work",
        "assistant",
        "I’ve checked the required-field rules and the duplicate preview. I’m now tracing what happens when only part of a file is valid.\n\nThe main issue is that a single bad row currently forces the whole upload to start again.",
      ),
    ],
    activity: [
      {
        id: "parse",
        title: "Inspect file validation",
        detail:
          "Checked required columns, empty values, and invalid dates against the sample import contract.",
        complete: true,
      },
      {
        id: "duplicates",
        title: "Check duplicate handling",
        detail:
          "Compared duplicate detection with the preview step. Matching records need an explicit skip or update choice.",
        complete: true,
      },
      {
        id: "recovery",
        title: "Trace partial-failure recovery",
        detail:
          "Reviewing how valid and invalid rows are separated and whether a corrected file can be retried.",
        complete: false,
      },
    ],
    controls: [],
  },
  {
    id: "accessibility",
    name: "Accessibility reviewer",
    role: "Keyboard & feedback",
    task: "Check the import flow for keyboard access, focus movement, and understandable progress and error feedback.",
    status: "completed",
    result:
      "Keep the upload control keyboard-accessible. Move focus to the error summary after validation fails, link each error to its row, and announce import progress without repeatedly interrupting the reader.",
    messages: [
      childMessage(
        "access-parent",
        "user",
        "Check the import flow for keyboard access, focus movement, and understandable progress and error feedback.",
      ),
      childMessage(
        "access-result",
        "assistant",
        "Three changes will make the flow easier to use.\n\n- **Keyboard:** keep a visible file-picker button alongside drag and drop.\n- **Errors:** focus the summary after validation and link each item to the affected row.\n- **Progress:** announce meaningful milestones rather than every imported record.\n\nThe confirmation step should return focus to the import results heading.",
      ),
    ],
    activity: [
      {
        id: "keyboard",
        title: "Review keyboard path",
        detail:
          "Traced file selection, validation errors, confirmation, and the result view.",
        complete: true,
      },
      {
        id: "feedback",
        title: "Review status announcements",
        detail:
          "Checked when progress and validation feedback should be announced.",
        complete: true,
      },
    ],
    controls: [],
  },
  {
    id: "security",
    name: "Security reviewer",
    role: "File & data boundaries",
    task: "Review accepted file types, size limits, workspace permissions, and the handling of sensitive imported fields.",
    status: "completed",
    result:
      "Validate file type and size on the server. Check workspace permissions before both preview and import. Exclude sensitive fields from error exports, and treat every imported value as data rather than executable markup.",
    messages: [
      childMessage(
        "security-parent",
        "user",
        "Review accepted file types, size limits, workspace permissions, and the handling of sensitive imported fields.",
      ),
      childMessage(
        "security-result",
        "assistant",
        "The review found four boundaries to make explicit.\n\n1. Enforce file type and size limits on the server.\n2. Recheck workspace permissions at import time.\n3. Keep sensitive fields out of downloadable error reports.\n4. Escape imported values wherever the preview renders them.\n\nThese controls belong in the import contract, not only in the file-picker UI.",
      ),
    ],
    activity: [
      {
        id: "file",
        title: "Inspect upload boundaries",
        detail:
          "Reviewed accepted types and the proposed server-side size limit.",
        complete: true,
      },
      {
        id: "permissions",
        title: "Check workspace permissions",
        detail:
          "Confirmed that preview and import need independent authorization checks.",
        complete: true,
      },
    ],
    controls: [],
  },
];
export type ChildAction =
  | { type: "steer" | "queue"; id: string; text: string }
  | { type: "cancel"; id: string }
  | { type: "withdraw"; id: string }
  | { type: "advance" };
export function transitionDelegatedChild(
  child: DelegatedChild,
  action: ChildAction,
): DelegatedChild {
  if (action.type === "withdraw")
    return {
      ...child,
      controls: child.controls.map((control) =>
        control.id === action.id && control.status === "queued"
          ? { ...control, status: "withdrawn" }
          : control,
      ),
    };
  if (child.status !== "running") return child;
  if (action.type === "steer" || action.type === "queue") {
    const text = action.text.trim();
    if (!text || child.controls.some((control) => control.id === action.id))
      return child;
    const control: ChildControl = {
      id: action.id,
      kind: action.type,
      text,
      status: action.type === "queue" ? "queued" : "applied",
    };
    return {
      ...child,
      controls: [...child.controls, control],
      messages:
        action.type === "steer"
          ? [
              ...child.messages,
              childMessage(`${action.id}-guidance`, "user", text),
            ]
          : child.messages,
    };
  }
  if (action.type === "cancel")
    return {
      ...child,
      status: "cancelled",
      controls: [
        ...child.controls.map((control) =>
          control.status === "queued"
            ? { ...control, status: "withdrawn" as const }
            : control,
        ),
        {
          id: action.id,
          kind: "cancel",
          text: "Stop this task",
          status: "applied",
        },
      ],
    };
  if (action.type === "advance") {
    const queued = child.controls.find(
      (control) => control.status === "queued",
    );
    if (queued)
      return {
        ...child,
        controls: child.controls.map((control) =>
          control.id === queued.id
            ? { ...control, status: "applied" }
            : control,
        ),
        messages: [
          ...child.messages,
          childMessage(`${queued.id}-queued`, "user", queued.text),
          childMessage(
            `${queued.id}-ack`,
            "assistant",
            "The queued follow-up is now part of this task. I’ll include it in the review before returning to the coordinator.",
          ),
        ],
      };
    return {
      ...child,
      status: "completed",
      activity: child.activity.map((item) => ({ ...item, complete: true })),
      messages: [
        ...child.messages,
        childMessage(`${child.id}-final`, "assistant", child.result),
      ],
    };
  }
  return child;
}
export interface ChildContinuation {
  id: string;
  sourceId: string;
  name: string;
  messages: AiChatMessageData[];
  draft: string;
}
export function createChildContinuation(
  child: DelegatedChild,
  id: string,
  draft: string,
): ChildContinuation | null {
  if (child.status !== "completed") return null;
  return {
    id,
    sourceId: child.id,
    name: child.name,
    messages: structuredClone(child.messages),
    draft,
  };
}
