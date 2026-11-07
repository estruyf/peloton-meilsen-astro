import * as React from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';
import type { RideEvent } from '../models';
import { getUpcomingEvents } from '../lib/api';
import { EventItem } from './EventItem';

const pageSize = 8;

export const CalendarView: React.FunctionComponent = () => {
  const [events, setEvents] = React.useState<RideEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [visible, setVisible] = React.useState(pageSize);

  React.useEffect(() => {
    getUpcomingEvents()
      .then(setEvents)
      .catch((err) => {
        console.error("Error fetching calendar events:", err);
        setError(err instanceof Error ? err.message : "Onbekende fout");
      })
      .finally(() => setLoading(false));
  }, []);

  // Group the visible events per month for a scannable season overview
  const months = React.useMemo(() => {
    const groups: { key: string; label: string; events: RideEvent[] }[] = [];
    for (const ev of events.slice(0, visible)) {
      const date = new Date(ev.start);
      const key = format(date, 'yyyy-MM');
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, label: format(date, 'MMMM yyyy', { locale: nl }), events: [] };
        groups.push(group);
      }
      group.events.push(ev);
    }
    return groups;
  }, [events, visible]);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Agenda wordt geladen">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-4 rounded-3xl border border-ink/10 bg-paper-50 p-4 md:items-center md:gap-6 md:p-5"
          >
            <div className="h-20 w-16 shrink-0 rounded-2xl bg-ink/10 md:h-24 md:w-20" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-16 rounded-full bg-ink/10" />
              <div className="h-6 w-2/3 max-w-sm rounded-full bg-ink/10" />
              <div className="h-4 w-1/2 max-w-xs rounded-full bg-ink/10" />
            </div>
            <div className="hidden gap-2 md:flex">
              <div className="h-11 w-36 rounded-full bg-ink/10" />
              <div className="h-11 w-11 rounded-full bg-ink/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-800">
        <p className="font-semibold">De agenda kon niet geladen worden.</p>
        <p className="mt-1 text-sm">Probeer het later opnieuw of contacteer ons via info@pelotonmeilsen.be. ({error})</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 p-10 text-center">
        <p className="font-display text-3xl">Geen geplande ritten</p>
        <p className="mt-2 text-ink/60">De nieuwe ritten verschijnen hier zodra ze ingepland zijn.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {months.map((month) => (
        <section key={month.key} aria-label={month.label}>
          <h3 className="mb-4 flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink/50">
            <span className="first-letter:uppercase">{month.label}</span>
            <span className="h-px flex-1 bg-ink/10" aria-hidden={true} />
          </h3>
          <ul className="space-y-3">
            {month.events.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </ul>
        </section>
      ))}

      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-sm text-ink/60">
          {Math.min(visible, events.length)} van {events.length} geplande activiteiten
        </p>
        {visible < events.length && (
          <button className="btn-ink" onClick={() => setVisible((v) => v + pageSize)}>
            Toon meer ritten
          </button>
        )}
      </div>
    </div>
  );
};
