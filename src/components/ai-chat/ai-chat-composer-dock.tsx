"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type AiChatTodoStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface AiChatTodo {
  id: string;
  content: string;
  status: AiChatTodoStatus;
  priority: "high" | "medium" | "low";
}

interface AiChatTodoDockProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  todos: AiChatTodo[];
}

function TodoStatusIndicator({ status }: { status: AiChatTodoStatus }) {
  return (
    <span
      className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-[border-color,background-color,opacity] duration-200",
        status === "pending" && "border-foreground/20 bg-background/50",
        status === "in_progress" && "border-foreground/25 bg-muted",
        status === "completed" && "border-foreground/25 bg-muted",
        status === "cancelled" &&
          "border-foreground/15 bg-background/40 opacity-60",
      )}
      aria-hidden="true"
    >
      {status === "in_progress" ? (
        <span className="bg-foreground size-1.5 animate-pulse rounded-full motion-reduce:animate-none" />
      ) : status === "completed" ? (
        <Check className="size-3" strokeWidth={2.2} />
      ) : null}
    </span>
  );
}

function AiChatTodoDock({
  collapsed,
  onCollapsedChange,
  todos,
}: AiChatTodoDockProps) {
  const completedCount = todos.filter(
    (todo) => todo.status === "completed",
  ).length;
  const activeTodo =
    todos.find((todo) => todo.status === "in_progress") ??
    todos.find((todo) => todo.status === "pending") ??
    todos.findLast((todo) => todo.status === "completed") ??
    todos[0];

  return (
    <Collapsible
      open={!collapsed}
      onOpenChange={(open) => onCollapsedChange(!open)}
      className="bg-muted/25 overflow-hidden rounded-xl border"
    >
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-[42px] w-full justify-start rounded-none px-4 text-[13px] font-normal hover:bg-transparent"
          aria-label={
            collapsed ? "Expand task progress" : "Collapse task progress"
          }
        >
          <span className="text-muted-foreground shrink-0">
            {completedCount} of {todos.length} todos completed
          </span>
          {collapsed ? (
            <span className="text-muted-foreground/75 min-w-0 flex-1 truncate text-left">
              {activeTodo?.content}
            </span>
          ) : (
            <span className="flex-1" />
          )}
          <ChevronDown
            className={cn(
              "text-muted-foreground transition-transform duration-300",
              collapsed && "rotate-180",
            )}
            aria-hidden="true"
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="CollapsibleContent">
        <div
          className="flex max-h-48 flex-col gap-1.5 overflow-y-auto px-3 pb-3"
          role="list"
        >
          {todos.map((todo) => {
            const isFinal =
              todo.status === "completed" || todo.status === "cancelled";

            return (
              <div
                key={todo.id}
                className="flex min-w-0 items-start gap-2.5 rounded-md px-1 py-1"
                data-priority={todo.priority}
                role="listitem"
                aria-label={`${todo.content}, ${todo.status.replace("_", " ")}`}
              >
                <TodoStatusIndicator status={todo.status} />
                <span
                  className={cn(
                    "min-w-0 text-[13px] leading-5 transition-colors",
                    todo.status === "pending" && "text-foreground/90",
                    isFinal && "text-muted-foreground line-through",
                  )}
                >
                  {todo.content}
                </span>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface AiChatComposerDockProps extends React.ComponentProps<"div"> {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  todos: AiChatTodo[];
}

function AiChatComposerDock({
  children,
  className,
  collapsed,
  onCollapsedChange,
  todos,
  ...props
}: AiChatComposerDockProps) {
  const hasTodos = todos.length > 0;

  return (
    <div
      className={cn("mx-auto w-full max-w-3xl", className)}
      data-has-todos={hasTodos}
      {...props}
    >
      {hasTodos ? (
        <AiChatTodoDock
          todos={todos}
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
        />
      ) : null}
      <div className={cn(hasTodos && "mt-2")}>{children}</div>
    </div>
  );
}

export { AiChatComposerDock, AiChatTodoDock };
