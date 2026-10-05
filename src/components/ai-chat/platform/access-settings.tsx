"use client";

import { Check, Plus, Search, UserRound, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { NoResults, PlatformSelect } from "./platform-ui";

const permissions = [
  "Read requests",
  "Run models",
  "Manage files",
  "Manage keys",
  "Manage members",
  "Manage billing",
];
type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  type: "User" | "Service account";
};
type Group = {
  id: string;
  name: string;
  description: string;
  members: string[];
  role: string;
};
type Role = { name: string; permissions: string[]; builtin: boolean };
type Invite = { id: string; email: string; role: string; expires: string };
const initialPeople: Person[] = [
  {
    id: "owner",
    name: "Alex Morgan",
    email: "alex@example.com",
    role: "Owner",
    type: "User",
  },
  {
    id: "maya",
    name: "Maya Chen",
    email: "maya@example.com",
    role: "Developer",
    type: "User",
  },
  {
    id: "sam",
    name: "Sam Rivera",
    email: "sam@example.com",
    role: "Reader",
    type: "User",
  },
  {
    id: "pipeline",
    name: "Production pipeline",
    email: "svc_production_01",
    role: "Developer",
    type: "Service account",
  },
];
const initialRoles: Role[] = [
  { name: "Owner", permissions, builtin: true },
  { name: "Developer", permissions: permissions.slice(0, 4), builtin: true },
  { name: "Reader", permissions: [permissions[0]], builtin: true },
  {
    name: "Support lead",
    permissions: permissions.slice(0, 3),
    builtin: false,
  },
];

export function AccessSettings({
  section,
  scope,
  defaultRole = "Developer",
}: {
  section: string;
  scope: "project" | "organization";
  defaultRole?: string;
}) {
  const [people, setPeople] = useState(initialPeople);
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "engineering",
      name: "Engineering",
      description: "Build and operate production integrations.",
      members: ["owner", "maya", "pipeline"],
      role: "Developer",
    },
    {
      id: "support",
      name: "Customer support",
      description: "Review requests and investigate customer issues.",
      members: ["sam"],
      role: "Reader",
    },
  ]);
  const [roles, setRoles] = useState(initialRoles);
  const [invites, setInvites] = useState<Invite[]>([
    {
      id: "invite-1",
      email: "jordan@example.com",
      role: "Developer",
      expires: "Sep 18, 2026",
    },
  ]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [editor, setEditor] = useState<
    "invite" | "service" | "person" | "group" | "role" | null
  >(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [remove, setRemove] = useState<{
    type: "person" | "group" | "role" | "invite";
    id: string;
    name: string;
  } | null>(null);
  function open(type: NonNullable<typeof editor>, id?: string) {
    setError("");
    setEditId(id ?? null);
    setEditor(type);
    setName("");
    setEmail("");
    setDescription("");
    setRole(defaultRole);
    setMembers([]);
    setSelectedPermissions([permissions[0]]);
    if (type === "person" && id) {
      const person = people.find((p) => p.id === id)!;
      setName(person.name);
      setEmail(person.email);
      setRole(person.role);
    }
    if (type === "group" && id) {
      const group = groups.find((g) => g.id === id)!;
      setName(group.name);
      setDescription(group.description);
      setMembers(group.members);
      setRole(group.role);
    }
    if (type === "role" && id) {
      const existing = roles.find((r) => r.name === id)!;
      setName(existing.name);
      setSelectedPermissions(existing.permissions);
    }
  }
  function save() {
    if (["service", "group", "role"].includes(editor ?? "") && !name.trim()) {
      setError("Enter a name.");
      return;
    }
    const nextId = `demo-${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
    if (editor === "invite") {
      if (
        people.some(
          (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
        ) ||
        invites.some(
          (i) => i.email.toLowerCase() === email.trim().toLowerCase(),
        )
      ) {
        setError(
          "This address is already a member or has a pending invitation.",
        );
        return;
      }
      setInvites((items) => [
        ...items,
        { id: nextId, email: email.trim(), role, expires: "Sep 18, 2026" },
      ]);
      toast.success("Demo invitation added", {
        description: "No email was sent.",
      });
    } else if (editor === "service") {
      if (
        people.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())
      ) {
        setError("Choose a different service account name.");
        return;
      }
      setPeople((items) => [
        ...items,
        {
          id: nextId,
          name: name.trim(),
          email: `svc_demo_${nextId.slice(-8)}`,
          type: "Service account",
          role,
        },
      ]);
      toast.success("Service account created in this demo");
    } else if (editor === "person") {
      setPeople((items) =>
        items.map((p) => (p.id === editId ? { ...p, role } : p)),
      );
      toast.success("Member role updated");
    } else if (editor === "group") {
      if (
        groups.some(
          (g) =>
            g.id !== editId &&
            g.name.toLowerCase() === name.trim().toLowerCase(),
        )
      ) {
        setError("A group with this name already exists.");
        return;
      }
      const group: Group = {
        id: editId ?? nextId,
        name: name.trim(),
        description: description.trim(),
        members,
        role,
      };
      setGroups((items) =>
        editId
          ? items.map((g) => (g.id === editId ? group : g))
          : [...items, group],
      );
      toast.success("Group saved");
    } else if (editor === "role") {
      if (!selectedPermissions.length) {
        setError("Select at least one permission.");
        return;
      }
      if (
        roles.some(
          (r) =>
            r.name !== editId &&
            r.name.toLowerCase() === name.trim().toLowerCase(),
        )
      ) {
        setError("A role with this name already exists.");
        return;
      }
      const nextRole = {
        name: name.trim(),
        permissions: selectedPermissions,
        builtin: false,
      };
      setRoles((items) =>
        editId
          ? items.map((r) => (r.name === editId ? nextRole : r))
          : [...items, nextRole],
      );
      if (editId && editId !== nextRole.name) {
        setPeople((items) =>
          items.map((p) =>
            p.role === editId ? { ...p, role: nextRole.name } : p,
          ),
        );
        setGroups((items) =>
          items.map((g) =>
            g.role === editId ? { ...g, role: nextRole.name } : g,
          ),
        );
        setInvites((items) =>
          items.map((i) =>
            i.role === editId ? { ...i, role: nextRole.name } : i,
          ),
        );
      }
      toast.success("Role saved");
    }
    setEditor(null);
  }
  const filteredPeople = people.filter(
    (p) =>
      `${p.name} ${p.email}`.toLowerCase().includes(query.toLowerCase()) &&
      (kind === "all" || kind === p.type),
  );
  const visible = ["members", "groups", "roles", "invitations"].includes(
    section,
  );
  return (
    <div hidden={!visible}>
      {section === "members" ? (
        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Members</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                People and service accounts with access to this {scope}.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => open("service")}
              >
                <Plus data-icon="inline-start" />
                Service account
              </Button>
              <Button size="sm" onClick={() => open("invite")}>
                <Plus data-icon="inline-start" />
                Invite member
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <InputGroup className="max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search members"
                placeholder="Search name or email…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <PlatformSelect
              label="Member type"
              value={kind}
              onChange={setKind}
              options={[
                { value: "all", label: "All members" },
                "User",
                "Service account",
              ]}
            />
          </div>
          {filteredPeople.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
                          <UserRound className="text-muted-foreground size-4" />
                        </span>
                        <div>
                          <p className="font-medium">
                            {person.name}
                            {person.id === "owner" ? " (you)" : ""}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {person.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {person.type}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{person.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={person.id === "owner"}
                        onClick={() => open("person", person.id)}
                      >
                        Edit role
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={person.id === "owner"}
                        onClick={() =>
                          setRemove({
                            type: "person",
                            id: person.id,
                            name: person.name,
                          })
                        }
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <NoResults
              title="No matching members"
              onClear={() => {
                setQuery("");
                setKind("all");
              }}
            />
          )}
          <p className="text-muted-foreground text-xs">
            {people.length} members · {invites.length} pending invitations. The
            workspace owner always retains access.
          </p>
          {scope === "project" && invites.length ? (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">Pending invitations</h3>
              {invites.map((invite) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                  key={invite.id}
                >
                  <span>
                    {invite.email}
                    <span className="text-muted-foreground ml-2 text-xs">
                      {invite.role}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setRemove({
                        type: "invite",
                        id: invite.id,
                        name: invite.email,
                      })
                    }
                  >
                    Cancel invitation
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
      {section === "invitations" ? (
        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Invitations</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Pending access requests for your organization.
              </p>
            </div>
            <Button size="sm" onClick={() => open("invite")}>
              <Plus data-icon="inline-start" />
              Invite member
            </Button>
          </div>
          {invites.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>{invite.role}</TableCell>
                    <TableCell>{invite.expires}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setInvites((items) =>
                            items.map((item) =>
                              item.id === invite.id
                                ? { ...item, expires: "Sep 25, 2026" }
                                : item,
                            ),
                          );
                          toast.success("Demo invitation renewed", {
                            description: "No email was sent.",
                          });
                        }}
                      >
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setRemove({
                            type: "invite",
                            id: invite.id,
                            name: invite.email,
                          })
                        }
                      >
                        Cancel invitation
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <NoResults
              title="No pending invitations"
              description="Invitations you create will appear here."
            />
          )}
        </section>
      ) : null}
      {section === "groups" ? (
        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Groups</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Give a team a shared role and manage its membership.
              </p>
            </div>
            <Button size="sm" onClick={() => open("group")}>
              <Plus data-icon="inline-start" />
              Create group
            </Button>
          </div>
          {groups.length ? (
            <div className="divide-y rounded-lg border">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex flex-wrap items-center gap-4 p-4"
                >
                  <Users className="text-muted-foreground size-5" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium">{group.name}</h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {group.description}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {group.members.length} members · {group.role}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => open("group", group.id)}
                  >
                    Manage
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setRemove({
                        type: "group",
                        id: group.id,
                        name: group.name,
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <NoResults
              title="No groups yet"
              description="Create a group to organize access for a team."
            />
          )}
        </section>
      ) : null}
      {section === "roles" ? (
        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Roles & permissions</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Review the permission matrix or define a custom role.
              </p>
            </div>
            <Button size="sm" onClick={() => open("role")}>
              <Plus data-icon="inline-start" />
              Create role
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                {roles.map((r) => (
                  <TableHead className="text-center" key={r.name}>
                    {r.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission}>
                  <TableCell className="font-medium">{permission}</TableCell>
                  {roles.map((r) => (
                    <TableCell key={r.name} className="text-center">
                      {r.permissions.includes(permission) ? (
                        <Check
                          className="mx-auto size-4"
                          aria-label="Allowed"
                        />
                      ) : (
                        <span
                          className="text-muted-foreground"
                          aria-label="Not allowed"
                        >
                          —
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell>Manage role</TableCell>
                {roles.map((r) => (
                  <TableCell key={r.name} className="text-center">
                    {r.builtin ? (
                      <span className="text-muted-foreground text-xs">
                        Built in
                      </span>
                    ) : (
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => open("role", r.name)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={[...people, ...groups, ...invites].some(
                            (item) => item.role === r.name,
                          )}
                          onClick={() =>
                            setRemove({
                              type: "role",
                              id: r.name,
                              name: r.name,
                            })
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-muted-foreground text-xs">
            Built-in roles cannot be edited. Remove role assignments before
            deleting a custom role.
          </p>
        </section>
      ) : null}
      <Dialog
        open={!!editor}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent className="max-h-[85svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editor === "invite"
                ? "Invite member"
                : editor === "service"
                  ? "Create service account"
                  : editor === "person"
                    ? `Edit ${name}`
                    : `${editId ? "Edit" : "Create"} ${editor ?? "item"}`}
            </DialogTitle>
            <DialogDescription>
              {editor === "invite"
                ? "This showcase records the invitation locally; no email is sent."
                : `Update access within this demo ${scope}.`}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <FieldGroup>
              {editor === "invite" ? (
                <Field>
                  <FieldLabel htmlFor={`${scope}-invite-email`}>
                    Email address
                  </FieldLabel>
                  <Input
                    id={`${scope}-invite-email`}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@example.com"
                  />
                </Field>
              ) : null}
              {["service", "group", "role"].includes(editor ?? "") ? (
                <Field>
                  <FieldLabel htmlFor={`${scope}-access-name`}>Name</FieldLabel>
                  <Input
                    id={`${scope}-access-name`}
                    required
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
              ) : null}
              {editor !== "role" ? (
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <PlatformSelect
                    label="Access role"
                    value={role}
                    onChange={setRole}
                    options={roles
                      .filter((r) => r.name !== "Owner")
                      .map((r) => r.name)}
                  />
                </Field>
              ) : null}
              {editor === "group" ? (
                <>
                  <Field>
                    <FieldLabel htmlFor={`${scope}-group-description`}>
                      Description
                    </FieldLabel>
                    <Textarea
                      id={`${scope}-group-description`}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Group members</FieldLabel>
                    <FieldDescription>
                      Choose people or service accounts already in this {scope}.
                    </FieldDescription>
                    {people.map((person) => (
                      <Field key={person.id} orientation="horizontal">
                        <Checkbox
                          id={`${scope}-group-${person.id}`}
                          checked={members.includes(person.id)}
                          onCheckedChange={(checked) =>
                            setMembers((items) =>
                              checked
                                ? [...items, person.id]
                                : items.filter((id) => id !== person.id),
                            )
                          }
                        />
                        <FieldLabel htmlFor={`${scope}-group-${person.id}`}>
                          {person.name}
                        </FieldLabel>
                      </Field>
                    ))}
                  </Field>
                </>
              ) : null}
              {editor === "role" ? (
                <Field>
                  <FieldLabel>Permissions</FieldLabel>
                  {permissions.map((permission, i) => (
                    <Field key={permission} orientation="horizontal">
                      <Checkbox
                        id={`${scope}-permission-${i}`}
                        checked={selectedPermissions.includes(permission)}
                        onCheckedChange={(checked) =>
                          setSelectedPermissions((items) =>
                            checked
                              ? [...items, permission]
                              : items.filter((p) => p !== permission),
                          )
                        }
                      />
                      <FieldLabel htmlFor={`${scope}-permission-${i}`}>
                        {permission}
                      </FieldLabel>
                    </Field>
                  ))}
                </Field>
              ) : null}
              {error ? (
                <p role="alert" className="text-destructive text-sm">
                  {error}
                </p>
              ) : null}
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditor(null)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editor === "invite" ? "Add demo invitation" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!remove}
        onOpenChange={(open) => {
          if (!open) setRemove(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {remove?.name}?</DialogTitle>
            <DialogDescription>
              {remove?.type === "person"
                ? "Their group memberships will also be removed from this demo."
                : "This removes the selected item from the demo workspace."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemove(null)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!remove) return;
                if (remove.type === "person") {
                  setPeople((items) => items.filter((p) => p.id !== remove.id));
                  setGroups((items) =>
                    items.map((g) => ({
                      ...g,
                      members: g.members.filter((id) => id !== remove.id),
                    })),
                  );
                } else if (remove.type === "group")
                  setGroups((items) => items.filter((g) => g.id !== remove.id));
                else if (remove.type === "role")
                  setRoles((items) =>
                    items.filter((r) => r.name !== remove.id),
                  );
                else
                  setInvites((items) =>
                    items.filter((i) => i.id !== remove.id),
                  );
                setRemove(null);
                toast.success("Removed from the demo");
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
