export interface EventApiData {
  id: string;
  name: string;
  description: string;
  art: string | null;
  minTeamSize: number;
  maxTeamSize: number;
  registrationDeadline: string;
  startsAt: string;
  endsAt: string;
  clubId: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClubApiData {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserApiData {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image: string | null;
  usn: string | null;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamApiData {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactApiData {
  id: string;
  type: string;
  title: string;
  value: string;
  eventId?: string | null;
  clubId?: string | null;
}

export interface LinkApiData {
  id: string;
  type: string;
  title: string;
  url: string;
  eventId?: string | null;
  clubId?: string | null;
}

export interface ClubMemberApiData {
  role: string;
  createdAt: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
}

/** Same shape as club members — `GET /api/teams/[id]` joins users identically. */
export type TeamMemberApiData = ClubMemberApiData;

export interface RegistrationApiData {
  id: string;
  mode: "SOLO" | "TEAM";
  createdAt: string;
  userId: string | null;
  teamId: string | null;
  userName: string | null;
  userEmail: string | null;
  teamName: string | null;
}

export interface AttendanceApiData {
  userId: string;
  createdAt: string;
  userName: string;
  userEmail: string;
}

export interface EventDetailApiResponse {
  event: EventApiData;
  club: ClubApiData | null;
  contacts: ContactApiData[];
  links: LinkApiData[];
}

export interface ClubDetailApiResponse {
  club: ClubApiData;
  members: ClubMemberApiData[];
  contacts: ContactApiData[];
  links: LinkApiData[];
}

export interface ClubEventsApiResponse {
  club: {
    id: string;
    name: string;
    slug: string;
  };
  events: EventApiData[];
}

export interface TeamDetailApiResponse {
  team: TeamApiData;
  members: TeamMemberApiData[];
}

export interface HistoryRegistrationApiData {
  registrationId: string;
  mode: "SOLO" | "TEAM";
  registeredAt: string;
  eventId: string;
  eventName: string;
  eventSlug: string;
  startsAt: string;
  endsAt: string;
  art: string | null;
  teamId: string | null;
  teamName: string | null;
}

export interface HistoryAttendanceApiData {
  checkedInAt: string;
  eventId: string;
  eventName: string;
  eventSlug: string;
  startsAt: string;
  endsAt: string;
}

export interface UserHistoryApiResponse {
  user: Pick<UserApiData, "id" | "name" | "slug">;
  registrations: HistoryRegistrationApiData[];
  attendances: HistoryAttendanceApiData[];
}
