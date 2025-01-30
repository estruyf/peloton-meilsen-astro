import * as React from 'react';

export interface ISummaryButtonsProps {
  garmin: string;
  location: string;
}

export const SummaryButtons: React.FunctionComponent<ISummaryButtonsProps> = ({
  garmin,
  location
}: React.PropsWithChildren<ISummaryButtonsProps>) => {

  return (
    <div className="space-x-2 justify-self-end">
      {
        garmin && (
          <a
            href={`https://connect.garmin.com/modern/course/${garmin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-accent text-primary text-sm rounded-lg hover:bg-accent/90 transition-colors"
          >
            GPX
          </a>
        )
      }

      {
        location && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-accent text-primary text-sm rounded-lg hover:bg-accent/90 transition-colors"
          >
            Bekijk startlocatie
          </a>
        )
      }
    </div>
  );
};
