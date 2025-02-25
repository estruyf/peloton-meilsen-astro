import * as React from 'react';
import { BiCalendarPlus } from 'react-icons/bi';
import type { Event } from '../models';

export interface ISummaryButtonsProps {
  event: Event;
  group1: string;
  group2: string;
  groupAll: string;
  description: string;
  garmin?: string;
}

export const SummaryButtons: React.FunctionComponent<ISummaryButtonsProps> = ({
  group1,
  group2,
  groupAll,
  event,
  description,
  garmin
}: React.PropsWithChildren<ISummaryButtonsProps>) => {

  const addSingleEventToCalendar = React.useCallback(() => {
    const calendarEvent = {
      title: event.summary,
      location: event.location,
      description: description,
      startTime: new Date(event.start.dateTime),
      endTime: new Date(event.end.dateTime),
    };

    const icsContent = `BEGIN:VCALENDAR
  VERSION:2.0
  BEGIN:VEVENT
  SUMMARY:${calendarEvent.title}
  DESCRIPTION:${calendarEvent.description}
  DTSTART:${calendarEvent.startTime.toISOString().replace(/-|:|\.\d+/g, '')}
  DTEND:${calendarEvent.endTime.toISOString().replace(/-|:|\.\d+/g, '')}
  LOCATION:${calendarEvent.location}
  END:VEVENT
  END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calendarEvent.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }, [event, description]);

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full lg:flex lg:space-x-2 lg:gap-0 lg:grid-cols-none lg:grid-rows-none lg:w-auto justify-self-end">
      {
        garmin && (
          <a
            href={`https://connect.garmin.com/modern/course/${garmin}`}
            target="_blank"
            rel="noopener noreferrer"
            title='GPX'
            className="w-full text-center lg:w-auto lg:flex items-center px-4 py-2 bg-secondary text-primary text-sm rounded-lg hover:bg-secondary/90 transition-colors"
          >
            GPX
          </a>
        )
      }

      {
        group1 && (
          <a
            href={group1}
            target="_blank"
            rel="noopener noreferrer"
            title='GPX'
            className="w-full text-center lg:w-auto lg:flex items-center px-4 py-2 bg-secondary text-primary text-sm rounded-lg hover:bg-secondary/90 transition-colors"
          >
            GPX (groep 1)
          </a>
        )
      }

      {
        group2 && (
          <a
            href={group2}
            target="_blank"
            rel="noopener noreferrer"
            title='GPX'
            className="w-full text-center lg:w-auto lg:flex items-center px-4 py-2 bg-secondary text-primary text-sm rounded-lg hover:bg-secondary/90 transition-colors"
          >
            GPX (groep 2)
          </a>
        )
      }

      {
        groupAll && (
          <a
            href={groupAll}
            target="_blank"
            rel="noopener noreferrer"
            title='GPX'
            className="w-full text-center lg:w-auto lg:flex items-center px-4 py-2 bg-secondary text-primary text-sm rounded-lg hover:bg-secondary/90 transition-colors"
          >
            GPX
          </a>
        )
      }

      {
        event.location && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            title='Bekijk startlocatie'
            className="w-full text-center lg:w-auto lg:flex items-center px-4 py-2 bg-secondary text-primary text-sm rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Bekijk startlocatie
          </a>
        )
      }

      <button
        className="w-full text-center lg:w-auto lg:flex items-center px-4 py-2 bg-secondary text-primary text-sm rounded-lg hover:bg-secondary/90 transition-colors"
        title='Voeg toe aan je agenda'
        onClick={addSingleEventToCalendar}
      >
        <span className='sr-only'>Voeg toe aan je agenda</span>
        <BiCalendarPlus className='h-6 mx-auto' aria-hidden={true} />
      </button>
    </div>
  );
};
