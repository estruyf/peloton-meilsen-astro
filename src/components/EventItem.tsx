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
    <li className="py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-semibold text-light mb-2 inline-flex items-center space-x-2">{icon}<span>{event.summary}</span></h3>
          <p className="text-secondary">
            {formatEventDate(event.start.dateTime)}
          </p>
          <p className="text-secondary">
            {formatEventTime(event.start.dateTime)}
          </p>
        </div>

        <div className="md:text-right">
          {
            distanceInfo && (
              <p className="inline-flex items-center gap-2 text-secondary mb-2">
                <RiPinDistanceFill aria-hidden={true} /> {distanceInfo}
              </p>
            )
          }
          <p className="text-secondary mb-2">{event.location}</p>

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