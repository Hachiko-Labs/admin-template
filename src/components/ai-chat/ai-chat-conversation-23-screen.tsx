"use client";

import {
  Check,
  ChevronDown,
  Copy,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerButton,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import {
  AiChatComposerDock,
  type AiChatTodo,
} from "@/components/ai-chat/ai-chat-composer-dock";
import { AiChatAddContextAction } from "@/components/ai-chat/ai-chat-context-picker";
import { AiConversationShell } from "@/components/ai-chat/ai-conversation-shell";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const effortLevels = ["Low", "Medium", "High"];

const initialTodos: AiChatTodo[] = [
  {
    id: "branch-state",
    content:
      "Establish the current branch, worktree state, and relevant history",
    status: "in_progress",
    priority: "high",
  },
  {
    id: "implementation-map",
    content: "Map the implementation across the app and shared packages",
    status: "pending",
    priority: "high",
  },
  {
    id: "test-gaps",
    content: "Inspect tests, unfinished markers, and staging-only differences",
    status: "pending",
    priority: "medium",
  },
  {
    id: "handoff",
    content: "Summarize the handoff state, gaps, and recommended next action",
    status: "pending",
    priority: "medium",
  },
];

export function AiChatConversation23Screen() {
  const [prompt, setPrompt] = React.useState("");
  const [model, setModel] = React.useState(defaultAiModelId);
  const [effort, setEffort] = React.useState("High");
  const [todos, setTodos] = React.useState<AiChatTodo[]>(initialTodos);
  const [todosCollapsed, setTodosCollapsed] = React.useState(false);

  const activeTodo = todos.find((todo) => todo.status === "in_progress");
  const allTodosFinal =
    todos.length > 0 &&
    todos.every(
      (todo) => todo.status === "completed" || todo.status === "cancelled",
    );

  React.useEffect(() => {
    if (!allTodosFinal) return;

    const timer = window.setTimeout(() => setTodos([]), 400);
    return () => window.clearTimeout(timer);
  }, [allTodosFinal]);

  function resetRun() {
    setTodos(initialTodos);
    setTodosCollapsed(false);
  }

  function advanceRun() {
    if (todos.length === 0) {
      resetRun();
      return;
    }

    setTodos((current) => {
      const activeIndex = current.findIndex(
        (todo) => todo.status === "in_progress",
      );
      if (activeIndex === -1) return current;

      const nextIndex = current.findIndex(
        (todo, index) => index > activeIndex && todo.status === "pending",
      );

      return current.map((todo, index) => {
        if (index === activeIndex) return { ...todo, status: "completed" };
        if (index === nextIndex) return { ...todo, status: "in_progress" };
        return todo;
      });
    });
  }

  function stopRun() {
    setTodos((current) =>
      current.map((todo) =>
        todo.status === "completed" ? todo : { ...todo, status: "cancelled" },
      ),
    );
  }

  function submitPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeTodo || !prompt.trim()) return;
    setPrompt("");
  }

  return (
    <AiConversationShell
      headerTitle="Quotation feature staging"
      hideSidebarFooter
      headerActions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-normal"
            aria-label={todos.length === 0 ? "Start run" : "Advance task"}
            onClick={advanceRun}
            disabled={todos.length > 0 && !activeTodo}
          >
            <SkipForward data-icon="inline-start" aria-hidden="true" />
            <span className="hidden sm:inline">
              {todos.length === 0 ? "Start run" : "Advance task"}
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={resetRun}
            aria-label="Reset task demo"
          >
            <RotateCcw aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Conversation options"
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <div className="flex justify-end">
              <p className="bg-muted max-w-[86%] rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-5 sm:max-w-[72%]">
                Review the quotation feature on the staging branch. Rebuild the
                context, identify the exact handoff state, and recommend what to
                do next.
              </p>
            </div>

            <article className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg border">
                <BrandMark size="xs" />
              </span>
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[13px] font-medium">
                    Shadcnblocks AI
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Code agent
                  </span>
                </div>
                <div className="flex flex-col gap-4 text-[13px] leading-5">
                  <p>
                    I’ll reconstruct the staging context from the branch,
                    implementation, and tests before making a recommendation.
                  </p>

                  <div className="flex flex-col gap-2.5 border-l pl-3">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Shell</span>
                      <code className="text-xs">
                        git status --short --branch
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Explored</span>
                      <span>2 implementation references</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Read</span>
                      <span>staging handoff and test notes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="bg-foreground size-1.5 animate-pulse rounded-full motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    <span className="font-medium">
                      {activeTodo ? "Working" : "Run complete"}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {activeTodo?.content ??
                        "The implementation state is ready to summarize"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy response"
                  >
                    <Copy aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Retry response"
                  >
                    <RefreshCw aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="bg-background shrink-0 px-3 pb-3 sm:px-5">
          <AiChatComposerDock
            todos={todos}
            collapsed={todosCollapsed}
            onCollapsedChange={setTodosCollapsed}
          >
            <AiChatComposer
              aria-label="Todo-aware AI composer"
              onSubmit={submitPrompt}
              className="max-w-none"
            >
              <AiChatComposerEditor
                aria-label="Message the code agent"
                placeholder="Ask anything, / for commands, @ for context..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-20 text-[13px]"
              />
              <AiChatComposerToolbar>
                <AiChatComposerToolbarGroup>
                  <AiChatAddContextAction />
                  <AiModelPicker value={model} onValueChange={setModel} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <AiChatComposerButton
                        size="sm"
                        className="hidden h-8 gap-1.5 rounded-lg px-2 text-xs font-normal sm:flex"
                      >
                        {effort}
                        <ChevronDown aria-hidden="true" />
                      </AiChatComposerButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Reasoning effort</DropdownMenuLabel>
                        {effortLevels.map((item) => (
                          <DropdownMenuItem
                            key={item}
                            onSelect={() => setEffort(item)}
                          >
                            {item}
                            {effort === item ? (
                              <Check className="ml-auto" aria-hidden="true" />
                            ) : null}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </AiChatComposerToolbarGroup>
                <AiChatComposerToolbarGroup side="end">
                  <AiChatComposerSubmit
                    status={activeTodo ? "streaming" : "ready"}
                    onStop={stopRun}
                    disabled={!prompt.trim()}
                  />
                </AiChatComposerToolbarGroup>
              </AiChatComposerToolbar>
            </AiChatComposer>
          </AiChatComposerDock>
        </div>
      </div>
    </AiConversationShell>
  );
}
