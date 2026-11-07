import * as React from 'react';
import { format, formatDistanceToNowStrict, isToday, isTomorrow } from 'date-fns';
import { nl } from 'date-fns/locale/nl';
import type { RideEvent } from '../models';
import { getUpcomingEvents } from '../lib/api';

const relativeDay = (date: Date) => {
  if (isToday(date)) return 'Vandaag';
  if (isTomorrow(date)) return 'Morgen';
  return `Over ${formatDistanceToNowStrict(date, { locale: nl, unit: 'day', roundingMethod: 'ceil' })}`;
};

/** Compact "next ride" teaser shown in the homepage hero. */
export const NextRide: React.FunctionComponent = () => {
  const [ride, setRide] = React.useState<RideEvent | null | undefined>(undefined);

  React.useEffect(() => {
    getUpcomingEvents()
      .then((events) => setRide(events[0] ?? null))
      .catch(() => setRide(null));
  }, []);

  // Nothing to show (no rides or API down): keep the hero clean
  if (ride === null) return null;

  if (ride === undefined) {
    return (
      <div className="w-full animate-pulse rounded-3xl border border-paper/15 bg-ink/60 p-5 backdrop-blur md:w-96" aria-hidden={true}>
        <div className="h-3 w-24 rounded-full bg-paper/20" />
        <div className="mt-4 h-6 w-48 rounded-full bg-paper/20" />
        <div className="mt-3 h-4 w-40 rounded-full bg-paper/15" />
      </div>
    );
  }

  const date = new Date(ride.start);
  const distances = ride.groups.map((g) => g.distance).filter(Boolean);

  return (
    <a
      href="#agenda"
      className="group block w-full rounded-3xl border border-paper/15 bg-ink/70 p-5 text-paper backdrop-blur transition-colors hover:border-signal md:w-96"
    >
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-signal">
          <span className="relative flex h-2 w-2" aria-hidden={true}>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          Volgende rit
        </p>
        <span className="text-xs font-medium text-paper/60">{relativeDay(date)}</span>
      </div>
      <p className="mt-3 text-xl font-bold leading-tight">{ride.title}</p>
      <p className="mt-1 text-sm text-paper/70 first-letter:uppercase">
        {format(date, 'EEEE d MMMM', { locale: nl })}
        {ride.hasStartTime && <> · {format(date, 'HH:mm')}</>}
        {ride.location && <> · {ride.location}</>}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {distances.map((d, i) => (
            <span key={i} className="rounded-full bg-paper/10 px-2.5 py-1 text-xs font-semibold">
              {d}
            </span>
          ))}
        </div>
        <span className="text-sm font-semibold text-paper/80 transition-transform group-hover:translate-x-1" aria-hidden={true}>
          →
        </span>
      </div>
    </a>
  );
};
