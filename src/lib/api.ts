import type { RideEvent } from "../models";

const webapp =
  "pelotonmeilsen-api-ethpfmc5gkenfbdx.westeurope-01.azurewebsites.net";

interface AzureCalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  startLocation: string;
  distanceGroup1?: string;
  distanceGroup2?: string;
  gpxGroup1Url?: string;
  gpxGroup2Url?: string;
  type: "ride" | "social";
}

export async function getMembers() {
  try {
    const apiUrl = `https://${webapp}/api/members`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching members:", error);
    return undefined;
  }
}

// Shared between islands on the same page (agenda + next-ride teaser),
// so the calendar API is only called once per page view.
let upcomingEventsPromise: Promise<RideEvent[]> | null = null;

export function getUpcomingEvents(): Promise<RideEvent[]> {
  if (!upcomingEventsPromise) {
    upcomingEventsPromise = fetchUpcomingEvents().catch((err) => {
      upcomingEventsPromise = null;
      throw err;
    });
  }
  return upcomingEventsPromise;
}

async function fetchUpcomingEvents(): Promise<RideEvent[]> {
  const today = new Date().toISOString().split("T")[0];
  const response = await fetch(
    `https://${webapp}/api/calendar?startDate=${today}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const calendarEvents: AzureCalendarEvent[] = await response.json();
  const now = new Date();

  return calendarEvents
    .map(
      (ev): RideEvent => ({
        id: ev.id,
        title: ev.title,
        // Without a start time we assume a 09:00 departure
        start: `${ev.date}T${ev.startTime || "09:00"}:00`,
        hasStartTime: !!ev.startTime,
        location: ev.startLocation,
        type: ev.type,
        groups: [
          { label: "Groep 1", distance: ev.distanceGroup1, gpxUrl: ev.gpxGroup1Url },
          { label: "Groep 2", distance: ev.distanceGroup2, gpxUrl: ev.gpxGroup2Url },
        ].filter((g) => g.distance || g.gpxUrl),
      })
    )
    .filter((ev) => new Date(ev.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
