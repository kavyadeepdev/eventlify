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
} from "./types";

export async function getUsers(search?: string): Promise<UserApiData[]> {
  try {
    let users;
    if (search) {
      users = await sql`
        SELECT id, name, email, email_verified, image, usn, slug, created_at, updated_at
        FROM users 
        WHERE name ILIKE ${"%" + search + "%"} 
           OR email ILIKE ${"%" + search + "%"} 
           OR usn ILIKE ${"%" + search + "%"}
        ORDER BY name ASC
      `;
    } else {
      users = await sql`
        SELECT id, name, email, email_verified, image, usn, slug, created_at, updated_at
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
      SELECT id, name, email, email_verified, image, usn, slug, created_at, updated_at
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
    const [user] = await sql`SELECT id, name, slug FROM users WHERE slug = ${slug}`;
    if (!user) return null;

    const registrations = await sql`
      SELECT r.id as registration_id, r.mode, r.created_at as registered_at,
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
      user: user as unknown as Pick<UserApiData, "id" | "name" | "slug">,
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
      SELECT id, name, description, logo, slug FROM clubs WHERE id = ${event.clubId}
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
        SELECT id, name, description, logo, slug, created_at, updated_at
        FROM clubs 
        WHERE name ILIKE ${"%" + search + "%"} 
           OR description ILIKE ${"%" + search + "%"}
        ORDER BY name ASC
      `;
    } else {
      clubs = await sql`
        SELECT id, name, description, logo, slug, created_at, updated_at
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
      SELECT id, name, description, logo, slug, created_at, updated_at FROM clubs WHERE slug = ${slug}
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

    return {
      club: club as unknown as ClubApiData,
      contacts: contacts as unknown as ContactApiData[],
      links: links as unknown as LinkApiData[],
      members: members as unknown as ClubMemberApiData[],
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
      SELECT r.id, r.mode, r.created_at,
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
