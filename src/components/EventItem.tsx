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

  const { description, garmin, type } = React.useMemo(() => {
    let description = "";
    try {
      const data = event.description.split(`---`);

      description = data[0];
      description = description.replace(/<\/?[^>]+(>|$)/g, "");

      let details = data[1];
      details = details.replace(/<\/?[^>]+(>|$)/g, "");
      details = details.replace(/&quot;/g, '"');
      const parsed = JSON.parse(details);

      return {
        description,
        garmin: parsed.garmin || null,
        type: parsed.type || null
      };
    } catch (e) {
      return {
        description,
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
            description && (
              <p className="inline-flex items-center gap-2 text-secondary mb-2">
                <RiPinDistanceFill aria-hidden={true} /> {description.split('\n').join(' - ')}
              </p>
            )
          }
          <p className="text-secondary mb-2">{event.location}</p>

          <SummaryButtons
            garmin={garmin}
            location={event.location}
          />
        </div>
      </div>
    </li>
  );
};