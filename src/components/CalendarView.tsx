import * as React from 'react';
import type { Event } from '../models';
import { EventItem } from './EventItem';

export interface ICalendarViewProps { }

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

const maxEvents = 10;

export const CalendarView: React.FunctionComponent<ICalendarViewProps> = () => {
  const [events, setEvents] = React.useState<(Event & AzureCalendarEvent)[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const webapp = "pelotonmeilsen-api-ethpfmc5gkenfbdx.westeurope-01.azurewebsites.net";
        const apiUrl = `https://${webapp}/api/calendar?startDate=${today}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const calendarEvents: AzureCalendarEvent[] = await response.json();

        // Map Azure events directly with minimal transformation
        const mappedEvents = calendarEvents.map((azEvent) => {
          // Combine date and startTime for the dateTime
          const dateTime = azEvent.startTime
            ? `${azEvent.date}T${azEvent.startTime}:00`
            : `${azEvent.date}T09:00:00`;

          return {
            kind: "calendar#event",
            etag: "",
            id: azEvent.id,
            status: "confirmed",
            htmlLink: "",
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            summary: azEvent.title,
            description: "",
            location: azEvent.startLocation,
            creator: {
              email: "info@pelotonmeilsen.be",
            },
            organizer: {
              email: "info@pelotonmeilsen.be",
              displayName: "Peloton Meilsen",
              self: false,
            },
            start: {
              dateTime,
              timeZone: "Europe/Brussels",
            },
            end: {
              dateTime,
              timeZone: "Europe/Brussels",
            },
            recurringEventId: "",
            originalStartTime: {
              dateTime,
              timeZone: "Europe/Brussels",
            },
            iCalUID: "",
            sequence: 0,
            eventType: "default",
            // Include Azure-specific fields
            title: azEvent.title,
            date: azEvent.date,
            startTime: azEvent.startTime,
            startLocation: azEvent.startLocation,
            distanceGroup1: azEvent.distanceGroup1,
            distanceGroup2: azEvent.distanceGroup2,
            gpxGroup1Url: azEvent.gpxGroup1Url,
            gpxGroup2Url: azEvent.gpxGroup2Url,
            type: azEvent.type,
          } as Event & AzureCalendarEvent;
        });

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Error fetching calendar events:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filterEvents = React.useMemo(() => {
    return events.filter(event => new Date(event.start.dateTime) >= new Date());
  }, [events]);

  const totalPages = Math.ceil(filterEvents.length / maxEvents);

  const currentEvents = React.useMemo(() => {
    const start = (currentPage - 1) * maxEvents;
    const end = start + maxEvents;
    return filterEvents.slice(start, end);
  }, [filterEvents, currentPage]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white/80 shadow-sm p-4 md:p-5 animate-pulse"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-start gap-3 w-full md:w-auto">
                <div className="h-10 w-10 rounded-full bg-primary/20" />
                <div className="space-y-2 w-full">
                  <div className="h-5 w-48 rounded bg-slate-200" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-4 w-16 rounded bg-slate-200" />
                    <div className="h-5 w-14 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-4 w-40 rounded bg-slate-200" />
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row md:justify-end md:items-center gap-3">
              <div className="h-10 w-28 rounded bg-slate-200" />
              <div className="h-10 w-28 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center py-8 text-red-500">Fout bij het laden van evenementen: {error}</p>;
  }

  if (!events || events.length === 0) {
    return <p>Er zijn geen geplande ritten.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-primary-light">
        {currentEvents.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </ul>

      <div className="flex justify-between items-center mt-6">
        <button
          className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Vorige
        </button>
        <span className="text-secondary/80">
          Pagina {currentPage} van {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Volgende
        </button>
      </div>
    </>
  );
};