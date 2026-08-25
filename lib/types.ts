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
  isPaid?: boolean;
  feeAmount?: number;
  upiId?: string | null;
  upiQrUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isPaid?: boolean;
  feeAmount?: number;
  upiId?: string | null;
  upiQrUrl?: string | null;
}

export interface ClubApiData {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  slug: string;
  status?: "ACTIVE" | "SUSPENDED";
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
  systemRole?: "USER" | "SUPER_ADMIN";
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
  customRoles?: ClubRoleApiData[];
}

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
  status?: "CONFIRMED" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED";
  paymentProofUrl?: string | null;
  transactionId?: string | null;
  rejectionReason?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
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
  roles?: ClubRoleApiData[];
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
  status?: "CONFIRMED" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED";
  paymentProofUrl?: string | null;
  transactionId?: string | null;
  rejectionReason?: string | null;
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
  user: Pick<UserApiData, "id" | "name" | "slug" | "usn" | "image">;
  registrations: HistoryRegistrationApiData[];
  attendances: HistoryAttendanceApiData[];
}

export interface ClubApplicationApiData {
  id: string;
  applicantId: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo: string | null;
  contactEmail: string;
  contactPhone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  applicantName?: string;
  applicantEmail?: string;
}

export interface ClubRoleApiData {
  id: string;
  clubId: string;
  name: string;
  color: string;
  rank: number;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClubApiKeyApiData {
  id: string;
  clubId: string;
  name: string;
  keyPrefix: string;
  allowedOrigins: string[];
  rateLimitPerMin: number;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface AdminStatsApiResponse {
  totalUsers: number;
  totalClubs: number;
  pendingApplications: number;
  totalEvents: number;
  totalRegistrations: number;
  turnoutRatePercentage: number;
}
