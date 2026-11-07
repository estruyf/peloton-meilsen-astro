import * as React from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';
import { BiCycling, BiParty, BiMap, BiTime } from "react-icons/bi";
import type { RideEvent } from '../models';
import { SummaryButtons } from './SummaryButtons';

export interface IEventItemProps {
  event: RideEvent;
}

export const isSocialEvent = (type?: string) => type === 'social' || type === 'party';

export const EventItem: React.FunctionComponent<IEventItemProps> = ({ event }) => {
  const date = new Date(event.start);
  const social = isSocialEvent(event.type);

  return (
    <li>
      <article className="group flex flex-col gap-4 rounded-3xl border border-ink/10 bg-paper-50 p-4 transition-colors hover:border-ink/30 md:flex-row md:items-center md:gap-6 md:p-5">
        <div className="flex items-start gap-4 md:flex-1 md:items-center md:gap-6">
          <time
            dateTime={event.start}
            className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl py-3 md:w-20 md:py-4 ${social ? 'bg-kit text-paper' : 'bg-ink text-paper'}`}
          >
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-paper/60">
              {format(date, 'EEE', { locale: nl })}
            </span>
            <span className="font-display text-4xl md:text-5xl">{format(date, 'd')}</span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-signal">
              {format(date, 'MMM', { locale: nl }).replace('.', '')}
            </span>
          </time>

          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-kit">
              {social ? <BiParty aria-hidden={true} /> : <BiCycling aria-hidden={true} />}
              {social ? 'Sociaal' : 'Rit'}
            </p>
            <h4 className="mt-1 text-xl font-bold leading-tight text-ink md:text-2xl">{event.title}</h4>
            <p className="sr-only">{format(date, "EEEE d MMMM yyyy", { locale: nl })}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/70">
              {event.hasStartTime && (
                <span className="inline-flex items-center gap-1.5">
                  <BiTime aria-hidden={true} className="text-ink/40" />
                  {social ? 'Start' : 'Vertrek'} {format(date, 'HH:mm')}
                </span>
              )}
              {event.location && (
                <span className="inline-flex items-center gap-1.5">
                  <BiMap aria-hidden={true} className="text-ink/40" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <SummaryButtons event={event} />
      </article>
    </li>
  );
};
