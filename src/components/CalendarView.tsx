import * as React from 'react';
import type { Event } from '../models';
import { EventItem } from './EventItem';

export interface ICalendarViewProps {
  events: Event[]
}

const maxEvents = 10;

export const CalendarView: React.FunctionComponent<ICalendarViewProps> = ({ events }: React.PropsWithChildren<ICalendarViewProps>) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(events.length / maxEvents);

  const filterEvents = React.useMemo(() => {
    return events.filter(event => new Date(event.start.dateTime) >= new Date());
  }, [events]);

  const currentEvents = React.useMemo(() => {
    const start = (currentPage - 1) * maxEvents;
    const end = start + maxEvents;
    return filterEvents.slice(start, end);
  }, [filterEvents, currentPage]);


  if (!events) {
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
          className="px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Vorige
        </button>
        <span className="text-accent/80">
          Pagina {currentPage} van {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Volgende
        </button>
      </div>
    </>
  );
};