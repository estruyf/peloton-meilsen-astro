import * as React from 'react';
import type { Event } from '../models';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';
import { SummaryButtons } from './SummaryButtons';
import { BiCycling, BiParty } from "react-icons/bi";
import { RiPinDistanceFill } from 'react-icons/ri';

export interface IEventItemProps {
  event: Event;
}

export const EventItem: React.FunctionComponent<IEventItemProps> = ({
  event
}: React.PropsWithChildren<IEventItemProps>) => {

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "EEEE, d MMMM yyyy", { locale: nl });
  }

  const formatEventTime = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "HH:mm");
  }

  // Get Azure calendar properties if available, otherwise use Google Calendar format
  const azureEvent = event as any;
  const distanceGroup1 = azureEvent.distanceGroup1;
  const distanceGroup2 = azureEvent.distanceGroup2;
  const gpxGroup1Url = azureEvent.gpxGroup1Url;
  const gpxGroup2Url = azureEvent.gpxGroup2Url;
  const eventType = azureEvent.type;

  // Build distance info string
  const distances = [];
  if (distanceGroup1) {
    distances.push(`Groep 1: ${distanceGroup1}`);
  }
  if (distanceGroup2) {
    distances.push(`Groep 2: ${distanceGroup2}`);
  }
  const distanceInfo = distances.join(" - ");

  const icon = React.useMemo(() => {
    if (!eventType || eventType === 'fietsen' || eventType === 'ride') {
      return <BiCycling aria-hidden={true} />;
    } else if (eventType === 'social' || eventType === 'party') {
      return <BiParty aria-hidden={true} />;
    }

    return null;
  }, [eventType]);

  return (
    <li className="py-3">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/90 shadow-sm p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              {icon}
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-900 leading-snug">{event.summary}</h3>
              <div className="text-sm text-slate-600 flex flex-wrap gap-2 mt-1">
                <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                  {formatEventDate(event.start.dateTime)}
                  <span className="text-slate-400">•</span>
                  {formatEventTime(event.start.dateTime)}
                </span>
                {eventType && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {eventType === 'social' || eventType === 'party' ? 'Sociaal' : 'Rit'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 text-sm text-slate-700">
            {distanceInfo && (
              <p className="inline-flex items-center gap-2 font-medium">
                <RiPinDistanceFill aria-hidden={true} className="text-primary" />
                {distanceInfo}
              </p>
            )}
            {event.location && (
              <p className="text-slate-600">{event.location}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-3">
          <SummaryButtons
            event={event}
            group1={gpxGroup1Url || null}
            group2={gpxGroup2Url || null}
            description={event.summary}
          />
        </div>
      </div>
    </li>
  );
};