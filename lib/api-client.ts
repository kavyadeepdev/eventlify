import {
  EventApiData,
  ClubApiData,
  EventDetailApiResponse,
  ClubDetailApiResponse,
  ClubEventsApiResponse,
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

export async function fetchEvents(search?: string, clubId?: string): Promise<EventApiData[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (clubId) params.set("clubId", clubId);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${getBaseUrl()}/api/events${queryString}`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch (error) {
    console.error("fetchEvents error:", error);
    return [];
  }
}

export async function fetchClubs(search?: string): Promise<ClubApiData[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${getBaseUrl()}/api/clubs${queryString}`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.clubs || [];
  } catch (error) {
    console.error("fetchClubs error:", error);
    return [];
  }
}

export async function fetchEventBySlug(slug: string): Promise<EventDetailApiResponse | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/events/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`fetchEventBySlug error for ${slug}:`, error);
    return null;
  }
}

export async function fetchClubBySlug(slug: string): Promise<ClubDetailApiResponse | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/clubs/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`fetchClubBySlug error for ${slug}:`, error);
    return null;
  }
}

export async function fetchEventsByClubSlug(slug: string): Promise<EventApiData[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/clubs/${encodeURIComponent(slug)}/events`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data: ClubEventsApiResponse = await res.json();
    return data.events || [];
  } catch (error) {
    console.error(`fetchEventsByClubSlug error for ${slug}:`, error);
    return [];
  }
}
