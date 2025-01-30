import * as React from 'react';
import type { Event } from '../models';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';
import { SummaryButtons } from './SummaryButtons';
import { BiCycling, BiParty } from "react-icons/bi";

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

  const { garmin, type } = React.useMemo(() => {
    try {
      const parsed = JSON.parse(event.description);
      return {
        garmin: parsed.garmin || null,
        type: parsed.type || null
      };
    } catch (e) {
      return {
        garmin: null,
        type: null
      };
    }
  }, [event]);

  const icon = React.useMemo(() => {
    if (!type || type === 'fietsen') {
      return <BiCycling aria-hidden={true} />;
    } else if (type === 'social' || type === 'party') {
      return <BiParty aria-hidden={true} />;
    }

    return null;
  }, [type]);

  return (
    <li key={event.id} className="py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-semibold mb-2 inline-flex items-center space-x-2">{icon}<span>{event.summary}</span></h3>
          <p className="text-accent/80">
            {formatEventDate(event.start.dateTime)}
          </p>
          <p className="text-accent/80">
            {formatEventTime(event.start.dateTime)}
          </p>
        </div>

        <div className="md:text-right">
          <p className="text-accent/80 mb-2">{event.location}</p>

          <SummaryButtons
            garmin={garmin}
            location={event.location}
          />
        </div>
      </div>
    </li>
  );
};