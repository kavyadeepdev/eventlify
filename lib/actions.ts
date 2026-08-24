"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendJson } from "@/lib/api-client";
import { getSessionUser } from "@/lib/session";
import { EventApiData, TeamApiData } from "@/lib/types";
import type { ActionState } from "@/lib/action-state";

import { updateUserProfile } from "@/lib/db-queries";

const failure = (error: string): ActionState => ({
  ok: false,
  message: null,
  error,
});

const success = (message: string): ActionState => ({
  ok: true,
  message,
  error: null,
});

/**
 * Every mutation requires a signed-in user. Note the REST API itself is still
 * open — this is a UI-level guard, not a replacement for API authorization.
 */
async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

/**
 * Any 8-4-4-4-12 hex id. Zod's `uuid()` also enforces an RFC version nibble,
 * which the project's seeded ids (`00000000-0000-0000-0000-000000000006`)
 * don't carry — the frontend shouldn't be stricter than the database.
 */
const uuidLike = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "That doesn't look like a valid record id"
  );

/* ------------------------------ registrations ------------------------------- */

export async function registerSoloAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const slug = String(formData.get("eventSlug") ?? "");
  if (!slug) return failure("Missing event.");

  const user = await getSessionUser();
  if (!user) return failure("Sign in with your campus account to register.");

  const result = await sendJson(`/api/events/${encodeURIComponent(slug)}/register`, "POST", {
    mode: "SOLO",
    userId: user.id,
  });

  if (!result.ok) return failure(result.error ?? "Registration failed.");

  revalidatePath(`/events/${slug}`);
  revalidatePath("/dashboard");
  return success("You're in! See you there.");
}

const teamSchema = z.object({
  teamName: z.string().min(1, "Give your team a name").max(100),
  memberIds: z.array(uuidLike).max(50),
  minTeamSize: z.number().int().min(1),
  maxTeamSize: z.number().int().min(1),
});

export async function registerTeamAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const slug = String(formData.get("eventSlug") ?? "");
  if (!slug) return failure("Missing event.");

  const user = await getSessionUser();
  if (!user) return failure("Sign in with your campus account to register.");

  const parsed = teamSchema.safeParse({
    teamName: String(formData.get("teamName") ?? "").trim(),
    // The captain is implicit; the form submits teammates only.
    memberIds: formData.getAll("memberIds").map(String).filter(Boolean),
    minTeamSize: Number(formData.get("minTeamSize") ?? 1),
    maxTeamSize: Number(formData.get("maxTeamSize") ?? 1),
  });

  if (!parsed.success) {
    return failure(
      parsed.error.issues[0]?.message ?? "Check the team details and try again."
    );
  }

  const { teamName, minTeamSize, maxTeamSize } = parsed.data;
  const teammates = parsed.data.memberIds.filter((id) => id !== user.id);
  const size = teammates.length + 1;

  if (size < minTeamSize) {
    return failure(
      `This event needs at least ${minTeamSize} members — you have ${size}.`
    );
  }
  if (size > maxTeamSize) {
    return failure(
      `This event allows at most ${maxTeamSize} members — you have ${size}.`
    );
  }

  const created = await sendJson<{ team: TeamApiData }>("/api/teams", "POST", {
    name: teamName,
  });
  if (!created.ok || !created.data?.team) {
    return failure(created.error ?? "Could not create the team.");
  }

  const teamId = created.data.team.id;

  // Captain first, then teammates.
  const captain = await sendJson(`/api/teams/${teamId}/members`, "POST", {
    userId: user.id,
    role: "ADMIN",
  });
  if (!captain.ok) return failure(captain.error ?? "Could not add you to the team.");

  for (const memberId of teammates) {
    const added = await sendJson(`/api/teams/${teamId}/members`, "POST", {
      userId: memberId,
      role: "MEMBER",
    });
    if (!added.ok) return failure(added.error ?? "Could not add a teammate.");
  }

  const registered = await sendJson(
    `/api/events/${encodeURIComponent(slug)}/register`,
    "POST",
    { mode: "TEAM", teamId }
  );
  if (!registered.ok) return failure(registered.error ?? "Registration failed.");

  revalidatePath(`/events/${slug}`);
  revalidatePath("/dashboard");
  return success(`Team "${teamName}" is registered. Good luck!`);
}

/* -------------------------------- attendance -------------------------------- */

export async function checkInAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const slug = String(formData.get("eventSlug") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");

  try {
    await requireUser();
  } catch {
    return failure("Sign in to record check-ins.");
  }

  if (!slug || (!userId && !teamId)) {
    return failure("Nothing to check in.");
  }

  const result = await sendJson(
    `/api/events/${encodeURIComponent(slug)}/attendance`,
    "POST",
    userId ? { userId } : { teamId }
  );

  if (!result.ok) return failure(result.error ?? "Check-in failed.");

  revalidatePath(`/events/${slug}/manage`);
  return success("Checked in.");
}

/* ---------------------------------- events ---------------------------------- */

const eventSchema = z
  .object({
    name: z.string().min(1, "Event name is required").max(200),
    description: z.string().min(1, "Tell students what this is about"),
    art: z.string().url("Cover art must be a valid URL").or(z.literal("")),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
    clubId: uuidLike.describe("clubId"),
    minTeamSize: z.number().int().min(1),
    maxTeamSize: z.number().int().min(1),
    registrationDeadline: z.string().min(1, "Set a registration deadline"),
    startsAt: z.string().min(1, "Set a start time"),
    endsAt: z.string().min(1, "Set an end time"),
  })
  .refine((data) => data.minTeamSize <= data.maxTeamSize, {
    message: "Minimum team size cannot exceed the maximum",
  })
  .refine(
    (data) =>
      new Date(data.registrationDeadline) <= new Date(data.startsAt),
    { message: "The deadline must fall on or before the start time" }
  )
  .refine((data) => new Date(data.startsAt) < new Date(data.endsAt), {
    message: "The event must end after it starts",
  });

export async function createEventAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return failure("Sign in to publish an event.");

  const parsed = eventSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    art: String(formData.get("art") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    clubId: String(formData.get("clubId") ?? ""),
    minTeamSize: Number(formData.get("minTeamSize") ?? 1),
    maxTeamSize: Number(formData.get("maxTeamSize") ?? 1),
    registrationDeadline: String(formData.get("registrationDeadline") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Check the form.");
  }

  const data = parsed.data;
  const result = await sendJson<{ event: EventApiData }>("/api/events", "POST", {
    ...data,
    art: data.art || null,
    registrationDeadline: new Date(data.registrationDeadline).toISOString(),
    startsAt: new Date(data.startsAt).toISOString(),
    endsAt: new Date(data.endsAt).toISOString(),
  });

  if (!result.ok) return failure(result.error ?? "Could not publish the event.");

  revalidatePath("/events");
  revalidatePath("/");
  redirect(`/events/${data.slug}`);
}

/* ------------------------------- club members ------------------------------- */

const memberSchema = z.object({
  clubSlug: z.string().min(1),
  userId: uuidLike,
  role: z.enum(["ADMIN", "MEMBER"]),
});

export async function addClubMemberAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return failure("Sign in to manage members.");

  const parsed = memberSchema.safeParse({
    clubSlug: String(formData.get("clubSlug") ?? ""),
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? "MEMBER"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Check the form.");
  }

  const { clubSlug, userId, role } = parsed.data;
  const result = await sendJson(
    `/api/clubs/${encodeURIComponent(clubSlug)}/members`,
    "POST",
    { userId, role }
  );

  if (!result.ok) return failure(result.error ?? "Could not add the member.");

  revalidatePath(`/clubs/${clubSlug}`);
  return success("Member added.");
}

export async function removeClubMemberAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return failure("Sign in to manage members.");

  const clubSlug = String(formData.get("clubSlug") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!clubSlug || !userId) return failure("Missing member details.");

  const result = await sendJson(
    `/api/clubs/${encodeURIComponent(clubSlug)}/members?userId=${encodeURIComponent(userId)}`,
    "DELETE"
  );

  if (!result.ok) return failure(result.error ?? "Could not remove the member.");

  revalidatePath(`/clubs/${clubSlug}`);
  return success("Member removed.");
}

/* --------------------------------- profile ---------------------------------- */

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  usn: z.string().max(30).or(z.literal("")),
});

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return failure("Sign in to edit your profile.");

  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    usn: String(formData.get("usn") ?? "").trim(),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Check the form.");
  }

  const ok = await updateUserProfile(user.id, {
    name: parsed.data.name,
    usn: parsed.data.usn || null,
  });

  if (!ok) return failure("Could not save your profile.");

  revalidatePath("/dashboard");
  return success("Profile updated.");
}
