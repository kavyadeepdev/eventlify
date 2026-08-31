import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

loadEnvConfig(process.cwd());

const dbUri = process.env.DATABASE_URI;

const sql = postgres(dbUri as string);

async function seed() {
  console.log("Seeding database with dummy data...");

  try {
    // users table
    await sql`
      INSERT INTO users
        (id, name, email, email_verified, image, usn, slug)
      VALUES
        (
          '00000000-0000-0000-0000-000000000001',
          'Aarav Sharma',
          'aarav@example.com',
          true,
          'https://api.dicebear.com/9.x/avataaars/svg?seed=Aarav',
          '1BM24CS001',
          'aarav-sharma'
        ),
        (
          '00000000-0000-0000-0000-000000000002',
          'Ananya Rao',
          'ananya@example.com',
          true,
          'https://api.dicebear.com/9.x/avataaars/svg?seed=Ananya',
          '1BM24CS002',
          'ananya-rao'
        ),
        (
          '00000000-0000-0000-0000-000000000003',
          'Rohan Mehta',
          'rohan@example.com',
          true,
          'https://api.dicebear.com/9.x/avataaars/svg?seed=Rohan',
          '1BM24CS003',
          'rohan-mehta'
        ),
        (
          '00000000-0000-0000-0000-000000000004',
          'Ishita Nair',
          'ishita@example.com',
          true,
          NULL,
          '1BM24CS004',
          'ishita-nair'
        ),
        (
          '00000000-0000-0000-0000-000000000005',
          'Aditya Singh',
          'aditya@example.com',
          true,
          NULL,
          '1BM24CS005',
          'aditya-singh'
        ),
        (
          '00000000-0000-0000-0000-000000000006',
          'Meera Iyer',
          'meera@example.com',
          true,
          NULL,
          '1BM24CS006',
          'meera-iyer'
        )
      ON CONFLICT (id) DO NOTHING
    `;

    // clubs table
    await sql`
      INSERT INTO clubs
        (id, name, description, logo, slug)
      VALUES
        (
          '10000000-0000-0000-0000-000000000001',
          'Protocol',
          'The official computer science technical club.',
          NULL,
          'protocol'
        ),
        (
          '10000000-0000-0000-0000-000000000002',
          'IEEE',
          'Student chapter focused on technology and engineering.',
          NULL,
          'ieee'
        ),
        (
          '10000000-0000-0000-0000-000000000003',
          'Quiz Club',
          'A community for trivia enthusiasts and competitive quizzers.',
          NULL,
          'quiz-club'
        )
      ON CONFLICT (id) DO NOTHING
    `;

    // club_members table
    await sql`
      INSERT INTO club_members
        (club_id, user_id, role)
      VALUES
        (
          '10000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000001',
          'ADMIN'
        ),
        (
          '10000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
          'MEMBER'
        ),
        (
          '10000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000003',
          'ADMIN'
        ),
        (
          '10000000-0000-0000-0000-000000000003',
          '00000000-0000-0000-0000-000000000004',
          'ADMIN'
        )
      ON CONFLICT (club_id, user_id) DO NOTHING
    `;

    // events table
    await sql`
      INSERT INTO events (
        id,
        name,
        description,
        art,
        min_team_size,
        max_team_size,
        registration_deadline,
        starts_at,
        ends_at,
        club_id,
        slug
      )
      VALUES
        (
          '20000000-0000-0000-0000-000000000001',
          'HackBMS 2026',
          'A 24-hour hackathon where teams build innovative products.',
          NULL,
          2,
          4,
          '2026-08-15 23:59:59+05:30',
          '2026-08-20 09:00:00+05:30',
          '2026-08-21 09:00:00+05:30',
          '10000000-0000-0000-0000-000000000001',
          'hackbms-2026'
        ),
        (
          '20000000-0000-0000-0000-000000000002',
          'Web Development Workshop',
          'An introductory workshop covering modern web development.',
          NULL,
          1,
          1,
          '2026-08-08 23:59:59+05:30',
          '2026-08-10 10:00:00+05:30',
          '2026-08-10 13:00:00+05:30',
          '10000000-0000-0000-0000-000000000001',
          'web-development-workshop'
        ),
        (
          '20000000-0000-0000-0000-000000000003',
          'Circuit Sprint',
          'A competitive electronics design challenge.',
          NULL,
          2,
          3,
          '2026-08-20 23:59:59+05:30',
          '2026-08-25 10:00:00+05:30',
          '2026-08-25 16:00:00+05:30',
          '10000000-0000-0000-0000-000000000002',
          'circuit-sprint'
        ),
        (
          '20000000-0000-0000-0000-000000000004',
          'BMS Open Quiz',
          'An open general knowledge quiz for students.',
          NULL,
          1,
          2,
          '2026-08-12 23:59:59+05:30',
          '2026-08-14 14:00:00+05:30',
          '2026-08-14 17:00:00+05:30',
          '10000000-0000-0000-0000-000000000003',
          'bms-open-quiz'
        ),
        (
          '20000000-0000-0000-0000-000000000005',
          'Project Blackscreen',
          'Run by Protocol as part of Pentagram Week 25. A competitive coding event in pairs under an unusual constraint: the coder''s screen goes dark, and their partner earns screen time back by solving aptitude puzzles. Precision, speed and clean teamwork decide it. Winners took home California Burrito coupons.',
          '/events/project-blackscreen.jpg',
          2,
          2,
          '2025-11-13 23:59:59+05:30',
          '2025-11-14 14:00:00+05:30',
          '2025-11-14 17:00:00+05:30',
          '10000000-0000-0000-0000-000000000001',
          'project-blackscreen'
        )
      ON CONFLICT (id) DO NOTHING
    `;

    // contacts table
    await sql`
      INSERT INTO contacts
        (id, type, event_id, club_id, title, value)
      VALUES
        (
          '30000000-0000-0000-0000-000000000001',
          'EMAIL',
          NULL,
          '10000000-0000-0000-0000-000000000001',
          'Protocol',
          'protocol@example.com'
        ),
        (
          '30000000-0000-0000-0000-000000000002',
          'PHONE',
          '20000000-0000-0000-0000-000000000001',
          NULL,
          'HackBMS Coordinator',
          '+91 9876543210'
        ),
        (
          '30000000-0000-0000-0000-000000000003',
          'PHONE',
          '20000000-0000-0000-0000-000000000005',
          NULL,
          'Aaryan Prakash',
          '+91 82176 17133'
        ),
        (
          '30000000-0000-0000-0000-000000000004',
          'PHONE',
          '20000000-0000-0000-0000-000000000005',
          NULL,
          'Renganayaki Murugesh',
          '+91 76762 00456'
        )
      ON CONFLICT (id) DO NOTHING
    `;

    // links table
    await sql`
      INSERT INTO links
        (id, type, event_id, club_id, title, url)
      VALUES
        (
          '40000000-0000-0000-0000-000000000001',
          'WEBSITE',
          NULL,
          '10000000-0000-0000-0000-000000000001',
          'Website',
          'https://example.com/protocol'
        ),
        (
          '40000000-0000-0000-0000-000000000002',
          'INSTAGRAM',
          NULL,
          '10000000-0000-0000-0000-000000000001',
          'Instagram',
          'https://instagram.com/example'
        ),
        (
          '40000000-0000-0000-0000-000000000003',
          'RULEBOOK',
          '20000000-0000-0000-0000-000000000001',
          NULL,
          'HackBMS Rulebook',
          'https://example.com/hackbms/rules'
        )
      ON CONFLICT (id) DO NOTHING
    `;

    // teams table
    await sql`
      INSERT INTO teams
        (id, name)
      VALUES
        (
          '50000000-0000-0000-0000-000000000001',
          'Null Pointers'
        ),
        (
          '50000000-0000-0000-0000-000000000002',
          'Segmentation Squad'
        )
      ON CONFLICT (id) DO NOTHING
    `;

    // team_members table
    await sql`
      INSERT INTO team_members
        (team_id, user_id, role)
      VALUES
        (
          '50000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000001',
          'LEADER'
        ),
        (
          '50000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
          'MEMBER'
        ),
        (
          '50000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000003',
          'LEADER'
        ),
        (
          '50000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000004',
          'MEMBER'
        ),
        (
          '50000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000005',
          'MEMBER'
        )
      ON CONFLICT (team_id, user_id) DO NOTHING
    `;

    // registrations table
    // team registrations
    await sql`
      INSERT INTO registrations
        (id, event_id, team_id, user_id, mode)
      VALUES
        (
          '60000000-0000-0000-0000-000000000001',
          '20000000-0000-0000-0000-000000000001',
          '50000000-0000-0000-0000-000000000001',
          NULL,
          'TEAM'
        ),
        (
          '60000000-0000-0000-0000-000000000002',
          '20000000-0000-0000-0000-000000000001',
          '50000000-0000-0000-0000-000000000002',
          NULL,
          'TEAM'
        )
      ON CONFLICT (id) DO NOTHING
    `;

    // individual registrations
    await sql`
      INSERT INTO registrations
        (id, event_id, user_id, team_id, mode)
      VALUES
        (
          '60000000-0000-0000-0000-000000000003',
          '20000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000003',
          NULL,
          'INDIVIDUAL'
        ),
        (
          '60000000-0000-0000-0000-000000000004',
          '20000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000006',
          NULL,
          'INDIVIDUAL'
        )
      ON CONFLICT (id) DO NOTHING
    `;

    // attendances table
    await sql`
      INSERT INTO attendances
        (event_id, user_id)
      VALUES
        (
          '20000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000003'
        ),
        (
          '20000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000006'
        )
      ON CONFLICT (event_id, user_id) DO NOTHING
    `;

    console.log("Database seeded successfully with dummy data.");
  } catch (error) {
    console.error("Failed to seed database with dummy data.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

seed();
