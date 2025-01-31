import * as React from 'react';
import type { Event } from '../models';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';
import { SummaryButtons } from './SummaryButtons';

export interface ICalendarViewProps {
  events: Event[]
}

const maxEvents = 10;

export const CalendarView: React.FunctionComponent<ICalendarViewProps> = ({ events }: React.PropsWithChildren<ICalendarViewProps>) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(events.length / maxEvents);

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "EEEE, d MMMM yyyy", { locale: nl });
  }

  const formatEventTime = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "HH:mm");
  }

  const filterEvents = React.useMemo(() => {
    return events.filter(event => new Date(event.start.dateTime) >= new Date());
  }, [events]);

  const currentEvents = React.useMemo(() => {
    const start = (currentPage - 1) * maxEvents;
    const end = start + maxEvents;
    return filterEvents.slice(start, end);
  }, [filterEvents, currentPage]);

  console.log(filterEvents);

  if (!events) {
    return <p>Er zijn geen geplande ritten.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-primary-light">
        {currentEvents.map((event) => (
          <li key={event.id} className="py-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl text-light font-semibold mb-2">{event.summary}</h3>
                <p className="text-secondary">
                  {formatEventDate(event.start.dateTime)}
                </p>
                <p className="text-secondary">
                  {formatEventTime(event.start.dateTime)}
                </p>
              </div>

              <div className="md:text-right">
                <p className="text-secondary mb-2">{event.location}</p>

                <SummaryButtons
                  description={event.description}
                  location={event.location}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <form>
        <input type="hidden" name="page" value={currentPage} />
      </form>

      <div className="flex justify-between items-center mt-6">
        <button
          className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Vorige
        </button>
        <span className="text-secondary/80">
          Pagina {currentPage} van {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Volgende
        </button>
      </div>
    </>
  );
};