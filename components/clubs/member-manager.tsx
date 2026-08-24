"use client";

import { useActionState, useMemo, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { addClubMemberAction, removeClubMemberAction } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { ClubMemberApiData, UserApiData } from "@/lib/types";
import { Input } from "@/components/ui/input";
import Avatar from "@/components/shared/avatar";
import SubmitButton from "@/components/shared/submit-button";
import FormMessage from "@/components/shared/form-message";
import { cn } from "@/lib/utils";

interface MemberManagerProps {
  clubSlug: string;
  members: ClubMemberApiData[];
  students: UserApiData[];
}

/** Roster editing for club admins: add a student, promote, or remove. */
export default function MemberManager({
  clubSlug,
  members,
  students,
}: MemberManagerProps) {
  const [addState, addSubmit] = useActionState(addClubMemberAction, idleState);
  const [removeState, removeSubmit] = useActionState(
    removeClubMemberAction,
    idleState
  );

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserApiData | null>(null);

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return students
      .filter(
        (student) =>
          !members.some((member) => member.userId === student.id) &&
          (student.name.toLowerCase().includes(term) ||
            student.email.toLowerCase().includes(term) ||
            (student.usn ?? "").toLowerCase().includes(term))
      )
      .slice(0, 5);
  }, [search, students, members]);

  return (
    <div className="brutal space-y-5 rounded-2xl bg-card p-6">
      <div>
        <h3 className="display text-2xl">Manage roster</h3>
        <p className="text-sm text-muted-foreground">
          Add students to the club or update who runs it.
        </p>
      </div>

      <form action={addSubmit} className="space-y-3">
        <input type="hidden" name="clubSlug" value={clubSlug} />
        <input type="hidden" name="userId" value={selected?.id ?? ""} />

        <div className="space-y-1.5">
          <label
            htmlFor="member-search"
            className="text-xs font-bold uppercase tracking-wide"
          >
            Find a student
          </label>
          <Input
            id="member-search"
            type="search"
            value={selected ? selected.name : search}
            onChange={(event) => {
              setSelected(null);
              setSearch(event.target.value);
            }}
            placeholder="Name, email or USN"
            autoComplete="off"
          />
        </div>

        {!selected && candidates.length ? (
          <ul className="divide-y-2 divide-dashed divide-ink/20 rounded-xl border-2 border-ink bg-paper">
            {candidates.map((student) => (
              <li key={student.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(student);
                    setSearch("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zest"
                >
                  <Avatar
                    name={student.name}
                    image={student.image}
                    size="sm"
                    className="border-2"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      {student.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {student.usn || student.email}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="member-role"
              className="text-xs font-bold uppercase tracking-wide"
            >
              Role
            </label>
            <select
              id="member-role"
              name="role"
              defaultValue="MEMBER"
              className="h-12 rounded-xl border-[3px] border-ink bg-card px-4 text-sm font-bold uppercase outline-none"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <SubmitButton
            variant="secondary"
            disabled={!selected}
            pendingLabel="Adding…"
            className="gap-1.5"
          >
            <UserPlus className="size-4" />
            Add member
          </SubmitButton>
        </div>

        <FormMessage state={addState} />
      </form>

      <div className="space-y-2 border-t-2 border-dashed border-ink/30 pt-4">
        <FormMessage state={removeState} />
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.userId}
              className="flex items-center gap-3 rounded-xl border-2 border-ink bg-paper px-3 py-2"
            >
              <Avatar
                name={member.name}
                image={member.image}
                size="sm"
                className="border-2"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">
                  {member.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {member.email}
                </span>
              </span>
              <span
                className={cn(
                  "rounded-full border-2 border-ink px-2.5 py-0.5 text-[10px] font-bold uppercase",
                  member.role === "ADMIN" ? "bg-grape text-white" : "bg-zest"
                )}
              >
                {member.role}
              </span>
              <form action={removeSubmit}>
                <input type="hidden" name="clubSlug" value={clubSlug} />
                <input type="hidden" name="userId" value={member.userId} />
                <SubmitButton
                  variant="ghost"
                  size="icon-sm"
                  pendingLabel=""
                  aria-label={`Remove ${member.name}`}
                >
                  <Trash2 className="size-4" />
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
