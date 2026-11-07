import * as React from 'react';
import { BiCalendarPlus, BiMap } from 'react-icons/bi';
import type { RideEvent, RideGroup } from '../models';
import { GPXViewer } from './GPXViewer';

export interface ISummaryButtonsProps {
  event: RideEvent;
}

// Rides don't carry an end time; assume a typical club ride duration
const DEFAULT_DURATION_HOURS = 3;

const toIcsDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
const escapeIcs = (value = '') => value.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');

export const SummaryButtons: React.FunctionComponent<ISummaryButtonsProps> = ({ event }) => {
  const [viewing, setViewing] = React.useState<RideGroup | null>(null);

  const addToCalendar = React.useCallback(() => {
    const start = new Date(event.start);
    const end = new Date(start.getTime() + DEFAULT_DURATION_HOURS * 60 * 60 * 1000);
    const description = event.groups
      .filter((g) => g.distance)
      .map((g) => `${g.label}: ${g.distance}`)
      .join('\n');

    // ICS lines must not be indented: a leading space marks a folded continuation line
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Peloton Meilsen//Agenda//NL',
      'BEGIN:VEVENT',
      `UID:${event.id}@pelotonmeilsen.be`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(start)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `LOCATION:${escapeIcs(event.location)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }, [event]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {event.groups.map((group) =>
          group.gpxUrl ? (
            <button
              key={group.label}
              type="button"
              onClick={() => setViewing(group)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/15 bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper sm:flex-none"
              title={`Bekijk route ${group.label.toLowerCase()}`}
            >
              <BiMap className="h-4 w-4" aria-hidden={true} />
              <span>{group.label}</span>
              {group.distance && <span className="font-normal opacity-70">· {group.distance}</span>}
            </button>
          ) : (
            <span
              key={group.label}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink/5 px-4 py-2.5 text-sm font-semibold text-ink sm:flex-none"
            >
              {group.label}
              {group.distance && <span className="font-normal opacity-70">· {group.distance}</span>}
            </span>
          )
        )}

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-signal hover:text-ink"
          title="Voeg toe aan je agenda"
          onClick={addToCalendar}
        >
          <span className="sr-only">Voeg {event.title} toe aan je agenda</span>
          <BiCalendarPlus className="h-5 w-5" aria-hidden={true} />
        </button>
      </div>

      {viewing?.gpxUrl && (
        <GPXViewer
          gpxUrl={viewing.gpxUrl}
          title={`${event.title} — ${viewing.label}`}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
};
