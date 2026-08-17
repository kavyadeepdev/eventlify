type EventType = {
  id: string;
  name: string;
  description: string;
  art: string;
  minTeamSize: number;
  maxTeamSize: number;
  registrationDeadline: string;
  startsAt: string;
  endsAt: string;
  clubId: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
};

const appUrl = process.env.APP_URL;

const fetchEvent = async (slug: string) => {
  const res = await fetch(`${appUrl}/api/events/${slug}`);
  const data = await res.json();
  if (res.status === 404) {
    console.error(data.error);
    return null;
  }
  return data.event;
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await fetchEvent(slug);
  return <div>hello</div>;
}
