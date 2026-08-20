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
