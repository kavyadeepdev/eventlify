import {
  EventApiData,
  ClubApiData,
  UserApiData,
  EventDetailApiResponse,
  ClubDetailApiResponse,
  ClubEventsApiResponse,
  TeamDetailApiResponse,
  UserHistoryApiResponse,
  RegistrationApiData,
  AttendanceApiData,
} from "./types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT || 3000}`;
}

/** Reads always hit the API fresh — campus event data changes constantly. */
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${getBaseUrl()}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    console.error(`GET ${path} failed:`, error);
    return null;
  }
}

export interface MutationResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Write helper shared by the server actions in `lib/actions.ts`. Surfaces the
 * API's own validation message so forms can show something meaningful.
 */
export async function sendJson<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown
): Promise<MutationResult<T>> {
  try {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      const details = payload?.details
        ? Object.values(payload.details as Record<string, string[]>)
            .flat()
            .join(", ")
        : null;
      return {
        ok: false,
        error: details || payload?.error || `Request failed (${res.status})`,
      };
    }

    return { ok: true, data: payload as T };
  } catch (error) {
    console.error(`${method} ${path} failed:`, error);
    return { ok: false, error: "Could not reach the server. Try again." };
  }
}

/* ----------------------------------- events ---------------------------------- */

export async function fetchEvents(
  search?: string,
  clubId?: string
): Promise<EventApiData[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (clubId) params.set("clubId", clubId);

  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await getJson<{ events: EventApiData[] }>(`/api/events${query}`);
  return data?.events ?? [];
}

export async function fetchEventBySlug(
  slug: string
): Promise<EventDetailApiResponse | null> {
  return getJson<EventDetailApiResponse>(
    `/api/events/${encodeURIComponent(slug)}`
  );
}

export async function fetchEventRegistrations(
  slug: string
): Promise<RegistrationApiData[]> {
  const data = await getJson<{ registrations: RegistrationApiData[] }>(
    `/api/events/${encodeURIComponent(slug)}/register`
  );
  return data?.registrations ?? [];
}

export async function fetchEventAttendance(
  slug: string
): Promise<AttendanceApiData[]> {
  const data = await getJson<{ attendances: AttendanceApiData[] }>(
    `/api/events/${encodeURIComponent(slug)}/attendance`
  );
  return data?.attendances ?? [];
}

/* ----------------------------------- clubs ----------------------------------- */

export async function fetchClubs(search?: string): Promise<ClubApiData[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await getJson<{ clubs: ClubApiData[] }>(`/api/clubs${query}`);
  return data?.clubs ?? [];
}

export async function fetchClubBySlug(
  slug: string
): Promise<ClubDetailApiResponse | null> {
  return getJson<ClubDetailApiResponse>(
    `/api/clubs/${encodeURIComponent(slug)}`
  );
}

export async function fetchEventsByClubSlug(
  slug: string
): Promise<EventApiData[]> {
  const data = await getJson<ClubEventsApiResponse>(
    `/api/clubs/${encodeURIComponent(slug)}/events`
  );
  return data?.events ?? [];
}

/* ----------------------------------- users ----------------------------------- */

export async function fetchUsers(search?: string): Promise<UserApiData[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await getJson<{ users: UserApiData[] }>(`/api/users${query}`);
  return data?.users ?? [];
}

export async function fetchUserBySlug(
  slug: string
): Promise<UserApiData | null> {
  const data = await getJson<{ user: UserApiData }>(
    `/api/users/${encodeURIComponent(slug)}`
  );
  return data?.user ?? null;
}

export async function fetchUserHistory(
  slug: string
): Promise<UserHistoryApiResponse | null> {
  return getJson<UserHistoryApiResponse>(
    `/api/users/${encodeURIComponent(slug)}/history`
  );
}

/* ----------------------------------- teams ----------------------------------- */

export async function fetchTeam(
  id: string
): Promise<TeamDetailApiResponse | null> {
  return getJson<TeamDetailApiResponse>(`/api/teams/${encodeURIComponent(id)}`);
}
