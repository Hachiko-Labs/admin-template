"use client";

import { ChevronDown, Plus } from "lucide-react";
import * as React from "react";

import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export const aiTeams = [
  { id: "shadcnblocks", name: "Shadcnblocks" },
  { id: "shadcnblocks-admin", name: "Shadcnblocks Admin" },
  { id: "shadcnblocks-templates", name: "Shadcnblocks Templates" },
];

export function AiTeamSwitcher({
  teams,
  value,
  onValueChange,
  onAddTeam,
}: {
  teams: typeof aiTeams;
  value: string;
  onValueChange: (value: string) => void;
  onAddTeam: (name: string) => void;
}) {
  const activeTeam = teams.find((team) => team.id === value) ?? teams[0];
  const [addingTeam, setAddingTeam] = React.useState(false);
  const [name, setName] = React.useState("");
  const nameId = React.useId();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className="w-fit max-w-full rounded-[4px] px-1.5"
                aria-label={`Switch team: ${activeTeam.name}`}
                title={activeTeam.name}
              >
                <div className="flex aspect-square size-5 shrink-0 items-center justify-center rounded-[3px] bg-black">
                  <BrandMark
                    decorative
                    size="xs"
                    className="brightness-0 invert"
                  />
                </div>
                <span className="truncate font-medium">{activeTeam.name}</span>
                <ChevronDown className="opacity-50" aria-hidden="true" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 rounded-[4px]"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
                Teams
              </DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => onValueChange(team.id)}
                  className="gap-2 p-2"
                >
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-xs border ${team.id === value ? "border-black bg-black" : ""}`}
                  >
                    <BrandMark
                      decorative
                      size="sm"
                      className={
                        team.id === value ? "brightness-0 invert" : undefined
                      }
                    />
                  </div>
                  <span className="truncate">{team.name}</span>
                  {index < 9 && (
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onSelect={() => {
                  setName("");
                  setAddingTeam(true);
                }}
              >
                <div className="bg-background flex size-6 items-center justify-center rounded-[3px] border">
                  <Plus className="size-4" aria-hidden="true" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add team
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={addingTeam} onOpenChange={setAddingTeam}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add team</DialogTitle>
            <DialogDescription>
              Create a team for this preview session.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              onAddTeam(name.trim());
              setAddingTeam(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor={nameId}>Team name</Label>
              <Input
                id={nameId}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={64}
                placeholder="Shadcnblocks Design"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddingTeam(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Add team
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
