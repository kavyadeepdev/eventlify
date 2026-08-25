import sql from "@/lib/db";
import {
  EventApiData,
  ClubApiData,
  UserApiData,
  EventDetailApiResponse,
  ClubDetailApiResponse,
  ClubMemberApiData,
  UserHistoryApiResponse,
  RegistrationApiData,
  AttendanceApiData,
  ContactApiData,
  LinkApiData,
  HistoryRegistrationApiData,
  HistoryAttendanceApiData,
  TeamDetailApiResponse,
  TeamApiData,
  TeamMemberApiData,
  ClubApplicationApiData,
  ClubRoleApiData,
  ClubApiKeyApiData,
  AdminStatsApiResponse,
} from "./types";

export async function getUsers(search?: string): Promise<UserApiData[]> {
  try {
    let users;
    if (search) {
      users = await sql`
        SELECT id, name, email, email_verified, image, usn, slug, system_role, created_at, updated_at
        FROM users 
        WHERE name ILIKE ${"%" + search + "%"} 
           OR email ILIKE ${"%" + search + "%"} 
           OR usn ILIKE ${"%" + search + "%"}
        ORDER BY name ASC
      `;
    } else {
      users = await sql`
        SELECT id, name, email, email_verified, image, usn, slug, system_role, created_at, updated_at
        FROM users 
        ORDER BY name ASC
      `;
    }
    return (users as unknown as UserApiData[]) ?? [];
  } catch (error) {
    console.error("getUsers error:", error);
    return [];
  }
}

export async function getUserBySlug(slug: string): Promise<UserApiData | null> {
  try {
    const [user] = await sql`
      SELECT id, name, email, email_verified, image, usn, slug, system_role, created_at, updated_at
      FROM users 
      WHERE slug = ${slug}
    `;
    return (user as unknown as UserApiData) ?? null;
  } catch (error) {
    console.error("getUserBySlug error:", error);
    return null;
  }
}

export async function getUserHistory(
  slug: string
): Promise<UserHistoryApiResponse | null> {
  try {
    const [user] = await sql`SELECT id, name, slug, usn, image FROM users WHERE slug = ${slug}`;
    if (!user) return null;

    const registrations = await sql`
      SELECT r.id as registration_id, r.mode, r.created_at as registered_at, r.status, r.payment_proof_url, r.transaction_id, r.rejection_reason,
             e.id as event_id, e.name as event_name, e.slug as event_slug, e.starts_at, e.ends_at, e.art,
             t.id as team_id, t.name as team_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN teams t ON r.team_id = t.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE r.user_id = ${user.id} OR tm.user_id = ${user.id}
      ORDER BY r.created_at DESC
    `;

    const attendances = await sql`
      SELECT a.created_at as checked_in_at,
             e.id as event_id, e.name as event_name, e.slug as event_slug, e.starts_at, e.ends_at
      FROM attendances a
      JOIN events e ON a.event_id = e.id
      WHERE a.user_id = ${user.id}
      ORDER BY a.created_at DESC
    `;

    return {
      user: user as unknown as Pick<UserApiData, "id" | "name" | "slug" | "usn" | "image">,
      registrations: registrations as unknown as HistoryRegistrationApiData[],
      attendances: attendances as unknown as HistoryAttendanceApiData[],
    };
  } catch (error) {
    console.error("getUserHistory error:", error);
    return null;
  }
}

export async function getEventBySlug(
  slug: string
): Promise<EventDetailApiResponse | null> {
  try {
    const [event] = await sql`SELECT * FROM events WHERE slug = ${slug}`;
    if (!event) return null;

    const [club] = await sql`
      SELECT id, name, description, logo, slug, status FROM clubs WHERE id = ${event.clubId}
    `;

    const contacts = await sql`
      SELECT id, type, title, value FROM contacts WHERE event_id = ${event.id}
    `;

    const links = await sql`
      SELECT id, type, title, url FROM links WHERE event_id = ${event.id}
    `;

    return {
      event: event as unknown as EventApiData,
      club: (club as unknown as ClubApiData) ?? null,
      contacts: contacts as unknown as ContactApiData[],
      links: links as unknown as LinkApiData[],
    };
  } catch (error) {
    console.error("getEventBySlug error:", error);
    return null;
  }
}

export async function getClubs(search?: string): Promise<ClubApiData[]> {
  try {
    let clubs;
    if (search) {
      clubs = await sql`
        SELECT id, name, description, logo, slug, status, created_at, updated_at
        FROM clubs 
        WHERE name ILIKE ${"%" + search + "%"} 
           OR description ILIKE ${"%" + search + "%"}
        ORDER BY name ASC
      `;
    } else {
      clubs = await sql`
        SELECT id, name, description, logo, slug, status, created_at, updated_at
        FROM clubs 
        ORDER BY name ASC
      `;
    }
    return (clubs as unknown as ClubApiData[]) ?? [];
  } catch (error) {
    console.error("getClubs error:", error);
    return [];
  }
}

export async function getClubBySlug(
  slug: string
): Promise<ClubDetailApiResponse | null> {
  try {
    const [club] = await sql`
      SELECT id, name, description, logo, slug, status, created_at, updated_at FROM clubs WHERE slug = ${slug}
    `;
    if (!club) return null;

    const contacts = await sql`
      SELECT id, type, title, value FROM contacts WHERE club_id = ${club.id}
    `;

    const links = await sql`
      SELECT id, type, title, url FROM links WHERE club_id = ${club.id}
    `;

    const members = await sql`
      SELECT cm.role, cm.created_at, u.id as user_id, u.name, u.email, u.image
      FROM club_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.club_id = ${club.id}
    `;

    const roles = await sql`
      SELECT id, club_id, name, color, rank, permissions, created_at, updated_at
      FROM club_roles
      WHERE club_id = ${club.id}
      ORDER BY rank ASC
    `;

    return {
      club: club as unknown as ClubApiData,
      contacts: contacts as unknown as ContactApiData[],
      links: links as unknown as LinkApiData[],
      members: members as unknown as ClubMemberApiData[],
      roles: roles as unknown as ClubRoleApiData[],
    };
  } catch (error) {
    console.error("getClubBySlug error:", error);
    return null;
  }
}

export async function getEventsByClubSlug(
  slug: string
): Promise<EventApiData[]> {
  try {
    const [club] = await sql`SELECT id FROM clubs WHERE slug = ${slug}`;
    if (!club) return [];
    const events = await sql`SELECT * FROM events WHERE club_id = ${club.id} ORDER BY starts_at ASC`;
    return events as unknown as EventApiData[];
  } catch (error) {
    console.error("getEventsByClubSlug error:", error);
    return [];
  }
}

export async function getEventRegistrations(
  slug: string
): Promise<RegistrationApiData[]> {
  try {
    const [event] = await sql`SELECT id FROM events WHERE slug = ${slug}`;
    if (!event) return [];
    const registrations = await sql`
      SELECT r.id, r.mode, r.created_at, r.status, r.payment_proof_url, r.transaction_id, r.rejection_reason,
             u.id as user_id, u.name as user_name, u.email as user_email,
             t.id as team_id, t.name as team_name
      FROM registrations r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN teams t ON r.team_id = t.id
      WHERE r.event_id = ${event.id}
      ORDER BY r.created_at DESC
    `;
    return registrations as unknown as RegistrationApiData[];
  } catch (error) {
    console.error("getEventRegistrations error:", error);
    return [];
  }
}

export async function getEventAttendance(
  slug: string
): Promise<AttendanceApiData[]> {
  try {
    const [event] = await sql`SELECT id FROM events WHERE slug = ${slug}`;
    if (!event) return [];
    const attendances = await sql`
      SELECT a.created_at, u.id as user_id, u.name as user_name, u.email as user_email
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      WHERE a.event_id = ${event.id}
      ORDER BY a.created_at DESC
    `;
    return attendances as unknown as AttendanceApiData[];
  } catch (error) {
    console.error("getEventAttendance error:", error);
    return [];
  }
}

export async function getTeam(
  id: string
): Promise<TeamDetailApiResponse | null> {
  try {
    const [team] = await sql`
      SELECT id, name, created_at, updated_at FROM teams WHERE id = ${id}
    `;
    if (!team) return null;

    const members = await sql`
      SELECT tm.role, tm.created_at, u.id as user_id, u.name, u.email, u.image
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ${team.id}
    `;

    return {
      team: team as unknown as TeamApiData,
      members: members as unknown as TeamMemberApiData[],
    };
  } catch (error) {
    console.error("getTeam error:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  data: { name: string; usn: string | null; image?: string | null }
): Promise<boolean> {
  try {
    if (data.image !== undefined) {
      await sql`
        UPDATE users SET
          name = ${data.name},
          usn = ${data.usn},
          image = ${data.image},
          updated_at = NOW()
        WHERE id = ${userId}
      `;
    } else {
      await sql`
        UPDATE users SET
          name = ${data.name},
          usn = ${data.usn},
          updated_at = NOW()
        WHERE id = ${userId}
      `;
    }
    return true;
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return false;
  }
}

/* --------------------------- Onboarding Applications -------------------------- */

export async function getClubApplications(status?: string): Promise<ClubApplicationApiData[]> {
  try {
    let rows;
    if (status) {
      rows = await sql`
        SELECT ca.*, u.name as applicant_name, u.email as applicant_email
        FROM club_applications ca
        JOIN users u ON ca.applicant_id = u.id
        WHERE ca.status = ${status}
        ORDER BY ca.created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT ca.*, u.name as applicant_name, u.email as applicant_email
        FROM club_applications ca
        JOIN users u ON ca.applicant_id = u.id
        ORDER BY ca.created_at DESC
      `;
    }
    return (rows as unknown as ClubApplicationApiData[]) ?? [];
  } catch (error) {
    console.error("getClubApplications error:", error);
    return [];
  }
}

export async function getClubApplicationById(id: string): Promise<ClubApplicationApiData | null> {
  try {
    const [app] = await sql`
      SELECT ca.*, u.name as applicant_name, u.email as applicant_email
      FROM club_applications ca
      JOIN users u ON ca.applicant_id = u.id
      WHERE ca.id = ${id}
    `;
    return (app as unknown as ClubApplicationApiData) ?? null;
  } catch (error) {
    console.error("getClubApplicationById error:", error);
    return null;
  }
}

/* ------------------------------- Admin Stats -------------------------------- */

export async function getAdminStats(): Promise<AdminStatsApiResponse> {
  try {
    const [{ count: userCount }] = await sql`SELECT count(*)::int FROM users`;
    const [{ count: clubCount }] = await sql`SELECT count(*)::int FROM clubs WHERE status = 'ACTIVE'`;
    const [{ count: appCount }] = await sql`SELECT count(*)::int FROM club_applications WHERE status = 'PENDING'`;
    const [{ count: eventCount }] = await sql`SELECT count(*)::int FROM events`;
    const [{ count: regCount }] = await sql`SELECT count(*)::int FROM registrations`;
    const [{ count: attCount }] = await sql`SELECT count(*)::int FROM attendances`;

    const totalHeadcount = Math.max(regCount, 1);
    const turnoutRate = Math.round((attCount / totalHeadcount) * 100);

    return {
      totalUsers: userCount,
      totalClubs: clubCount,
      pendingApplications: appCount,
      totalEvents: eventCount,
      totalRegistrations: regCount,
      turnoutRatePercentage: turnoutRate,
    };
  } catch (error) {
    console.error("getAdminStats error:", error);
    return {
      totalUsers: 0,
      totalClubs: 0,
      pendingApplications: 0,
      totalEvents: 0,
      totalRegistrations: 0,
      turnoutRatePercentage: 0,
    };
  }
}

export async function updateUserSystemRole(userId: string, role: "USER" | "SUPER_ADMIN"): Promise<boolean> {
  try {
    await sql`UPDATE users SET system_role = ${role}, updated_at = NOW() WHERE id = ${userId}`;
    return true;
  } catch (error) {
    console.error("updateUserSystemRole error:", error);
    return false;
  }
}

export async function updateClubStatus(clubId: string, status: "ACTIVE" | "SUSPENDED"): Promise<boolean> {
  try {
    await sql`UPDATE clubs SET status = ${status}, updated_at = NOW() WHERE id = ${clubId}`;
    return true;
  } catch (error) {
    console.error("updateClubStatus error:", error);
    return false;
  }
}

export async function reviewPaymentRegistration(
  registrationId: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string,
  verifiedBy?: string
): Promise<boolean> {
  try {
    await sql`
      UPDATE registrations SET
        status = ${status},
        rejection_reason = ${rejectionReason || null},
        verified_by = ${verifiedBy || null},
        verified_at = NOW()
      WHERE id = ${registrationId}
    `;
    return true;
  } catch (error) {
    console.error("reviewPaymentRegistration error:", error);
    return false;
  }
}
