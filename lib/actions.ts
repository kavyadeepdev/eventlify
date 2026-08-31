"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendJson } from "@/lib/api-client";
import { getSessionUser } from "@/lib/session";
import { EventApiData, TeamApiData } from "@/lib/types";
import type { ActionState } from "@/lib/action-state";

import {
  isUsnTaken,
  updateUserProfile,
  reviewPaymentRegistration,
  updateUserSystemRole,
  updateClubStatus,
} from "@/lib/db-queries";
import sql from "@/lib/db";

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

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

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

  const paymentProofUrl = String(formData.get("paymentProofUrl") ?? "").trim() || null;
  const transactionId = String(formData.get("transactionId") ?? "").trim() || null;

  const result = await sendJson(`/api/events/${encodeURIComponent(slug)}/register`, "POST", {
    mode: "SOLO",
    userId: user.id,
    paymentProofUrl,
    transactionId,
  });

  if (!result.ok) return failure(result.error ?? "Registration failed.");

  revalidatePath(`/events/${slug}`);
  revalidatePath("/dashboard");
  return success("Registration submitted successfully.");
}

const teamSchema = z.object({
  teamName: z.string().min(1, "Give your team a name").max(100),
  memberIds: z.array(uuidLike).max(50),
  minTeamSize: z.number().int().min(1),
  maxTeamSize: z.number().int().min(1),
  paymentProofUrl: z.string().optional(),
  transactionId: z.string().optional(),
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
    memberIds: formData.getAll("memberIds").map(String).filter(Boolean),
    minTeamSize: Number(formData.get("minTeamSize") ?? 1),
    maxTeamSize: Number(formData.get("maxTeamSize") ?? 1),
    paymentProofUrl: String(formData.get("paymentProofUrl") ?? "").trim() || undefined,
    transactionId: String(formData.get("transactionId") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return failure(
      parsed.error.issues[0]?.message ?? "Check the team details and try again."
    );
  }

  const { teamName, minTeamSize, maxTeamSize, paymentProofUrl, transactionId } = parsed.data;
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
    { mode: "TEAM", teamId, paymentProofUrl, transactionId }
  );
  if (!registered.ok) return failure(registered.error ?? "Registration failed.");

  revalidatePath(`/events/${slug}`);
  revalidatePath("/dashboard");
  return success(`Team "${teamName}" registration submitted.`);
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
  const isPaid = formData.get("isPaid") === "true";
  const feeAmount = Number(formData.get("feeAmount") ?? 0);
  const upiId = String(formData.get("upiId") ?? "").trim() || null;

  const result = await sendJson<{ event: EventApiData }>("/api/events", "POST", {
    ...data,
    art: data.art || null,
    isPaid,
    feeAmount,
    upiId,
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

/**
 * BMSCE USNs look like `1BM24CS001` — college code, admission year, branch,
 * roll. Kept slightly permissive so lateral-entry and future branch codes
 * still pass.
 */
const usnSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/,
    "That doesn't look like a USN (example: 1BM24CS001)"
  );

/**
 * Saves the profile picture chosen during onboarding. Separate from
 * `updateProfileAction` because onboarding collects only a picture — there is
 * no USN step, and reusing the profile schema would demand one.
 */
export async function saveProfilePictureAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return failure("Sign in to set your picture.");

  const parsed = z
    .string()
    .max(400_000, "That picture is too large.")
    .safeParse(String(formData.get("image") ?? ""));

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Check the picture.");
  }

  const ok = await updateUserProfile(user.id, {
    name: user.name,
    usn: user.usn,
    image: parsed.data || null,
  });

  if (!ok) return failure("Could not save your picture.");

  // Only the dashboard is revalidated. Revalidating /onboarding would refresh
  // the page the student is standing on mid-flow.
  revalidatePath("/dashboard");
  return success("Picture saved.");
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  usn: usnSchema,
  image: z.string().max(400_000).optional().default(""),
});

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return failure("Sign in to edit your profile.");

  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    usn: String(formData.get("usn") ?? ""),
    image: String(formData.get("image") ?? ""),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Check the form.");
  }

  const { name, usn, image } = parsed.data;

  if (await isUsnTaken(usn, user.id)) {
    return failure(`${usn} is already linked to another account.`);
  }

  const ok = await updateUserProfile(user.id, {
    name,
    usn,
    image: image || null,
  });

  if (!ok) return failure("Could not save your profile.");

  revalidatePath("/dashboard");
  return success("Pass updated.");
}

/* --------------------------- Payment Verification --------------------------- */

export async function reviewPaymentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return failure("Sign in to verify payments.");

  const registrationId = String(formData.get("registrationId") ?? "");
  const status = String(formData.get("status") ?? "") as "APPROVED" | "REJECTED";
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim();
  const eventSlug = String(formData.get("eventSlug") ?? "");

  if (!registrationId || !status) return failure("Missing verification data.");

  const ok = await reviewPaymentRegistration(registrationId, status, rejectionReason, user.id);
  if (!ok) return failure("Could not update payment verification status.");

  if (eventSlug) revalidatePath(`/events/${eventSlug}/manage`);
  return success(`Payment ${status.toLowerCase()}.`);
}

/* ---------------------------- Club Applications ----------------------------- */

export async function applyForClubAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const logo = String(formData.get("logo") ?? "").trim() || null;
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;

  if (!name || !slug || !category || !description || !contactEmail) return;

  try {
    await sql`
      INSERT INTO club_applications (
        applicant_id, name, slug, category, description, logo, contact_email, contact_phone
      ) VALUES (
        ${user.id}, ${name}, ${slug}, ${category}, ${description}, ${logo}, ${contactEmail}, ${contactPhone}
      )
    `;
    revalidatePath("/clubs/apply/status");
    redirect("/clubs/apply/status");
  } catch (error: any) {
    console.error("applyForClubAction error:", error);
  }
}

export async function reviewApplicationAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;

  const appId = String(formData.get("applicationId") ?? "");
  const action = String(formData.get("action") ?? "") as "APPROVE" | "REJECT";
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim();

  if (!appId || !action) return;

  try {
    const [app] = await sql`SELECT * FROM club_applications WHERE id = ${appId}`;
    if (!app) return;

    if (action === "APPROVE") {
      const [club] = await sql`
        INSERT INTO clubs (name, description, logo, slug, status)
        VALUES (${app.name}, ${app.description}, ${app.logo}, ${app.slug}, 'ACTIVE')
        RETURNING id
      `;

      await sql`
        INSERT INTO club_members (club_id, user_id, role)
        VALUES (${club.id}, ${app.applicant_id}, 'ADMIN')
        ON CONFLICT DO NOTHING
      `;

      await sql`
        UPDATE club_applications SET
          status = 'APPROVED',
          reviewed_by = ${user.id},
          reviewed_at = NOW()
        WHERE id = ${appId}
      `;
    } else {
      await sql`
        UPDATE club_applications SET
          status = 'REJECTED',
          rejection_reason = ${rejectionReason || null},
          reviewed_by = ${user.id},
          reviewed_at = NOW()
        WHERE id = ${appId}
      `;
    }

    revalidatePath("/admin/applications");
  } catch (error: any) {
    console.error("reviewApplicationAction error:", error);
  }
}

/* ------------------------------- Super Admin -------------------------------- */

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;

  const targetUserId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as "USER" | "SUPER_ADMIN";

  if (!targetUserId || !role) return;

  await updateUserSystemRole(targetUserId, role);
  revalidatePath("/admin/users");
}

export async function toggleClubStatusAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;

  const clubId = String(formData.get("clubId") ?? "");
  const status = String(formData.get("status") ?? "") as "ACTIVE" | "SUSPENDED";

  if (!clubId || !status) return;

  await updateClubStatus(clubId, status);
  revalidatePath("/admin/clubs");
}
