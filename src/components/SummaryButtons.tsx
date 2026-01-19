import * as React from 'react';
import { BiCalendarPlus, BiMap, BiDownload } from 'react-icons/bi';
import type { Event } from '../models';
import { GPXViewer } from './GPXViewer';

export interface ISummaryButtonsProps {
  event: Event;
  group1: string;
  group2: string;
  description: string;
  garmin?: string;
}

export const SummaryButtons: React.FunctionComponent<ISummaryButtonsProps> = ({
  group1,
  group2,
  event,
  description,
  garmin
}: React.PropsWithChildren<ISummaryButtonsProps>) => {
  const [viewingGpx, setViewingGpx] = React.useState<string | null>(null);
  const [gpxTitle, setGpxTitle] = React.useState<string>('');

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

  const handleDownloadGpx = React.useCallback((gpxUrl: string, label: string) => {
    const a = document.createElement('a');
    a.href = gpxUrl;
    a.download = `${event.summary}-${label}.gpx`;
    a.click();
  }, [event.summary]);

  const handleViewGpx = React.useCallback((gpxUrl: string, label: string) => {
    setViewingGpx(gpxUrl);
    setGpxTitle(`${event.summary} - ${label}`);
  }, [event.summary]);

  return (
    <>
      <div className="flex flex-col w-full gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        {
          garmin && (
            <a
              href={`https://connect.garmin.com/modern/course/${garmin}`}
              target="_blank"
              rel="noopener noreferrer"
              title='GPX'
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-secondary text-primary text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors"
            >
              GPX
            </a>
          )
        }

        {
          group1 && (
            <>
              <button
                onClick={() => handleViewGpx(group1, 'Groep 1')}
                title='Bekijk GPX op kaart'
                className="hidden lg:inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 bg-secondary text-primary text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <BiMap className="h-4 w-4 mr-1" aria-hidden={true} />
                <span>Kaart (groep 1)</span>
              </button>
              <button
                onClick={() => handleDownloadGpx(group1, 'Groep 1')}
                title='Download GPX'
                className="lg:hidden w-full items-center justify-center px-4 py-2 bg-secondary text-primary text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors inline-flex"
              >
                <BiDownload className="h-4 w-4 mr-1" aria-hidden={true} />
                <span>GPX (groep 1)</span>
              </button>
            </>
          )
        }

        {
          group2 && (
            <>
              <button
                onClick={() => handleViewGpx(group2, 'Groep 2')}
                title='Bekijk GPX op kaart'
                className="hidden lg:inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 bg-secondary text-primary text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <BiMap className="h-4 w-4 mr-1" aria-hidden={true} />
                <span>Kaart (groep 2)</span>
              </button>
              <button
                onClick={() => handleDownloadGpx(group2, 'Groep 2')}
                title='Download GPX'
                className="lg:hidden w-full items-center justify-center px-4 py-2 bg-secondary text-primary text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors inline-flex"
              >
                <BiDownload className="h-4 w-4 mr-1" aria-hidden={true} />
                <span>GPX (groep 2)</span>
              </button>
            </>
          )
        }

        <button
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-secondary text-primary text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors"
          title='Voeg toe aan je agenda'
          onClick={addSingleEventToCalendar}
        >
          <span className='sr-only'>Voeg toe aan je agenda</span>
          <BiCalendarPlus className='h-6 mx-auto' aria-hidden={true} />
        </button>
      </div>

      {viewingGpx && (
        <GPXViewer
          gpxUrl={viewingGpx}
          title={gpxTitle}
          onClose={() => setViewingGpx(null)}
        />
      )}
    </>
  );
};
