import * as React from 'react';

export interface ISummaryButtonsProps {
  description: string;
  location: string;
}

export const SummaryButtons: React.FunctionComponent<ISummaryButtonsProps> = ({
  description,
  location
}: React.PropsWithChildren<ISummaryButtonsProps>) => {

  const garmin = React.useMemo(() => {
    try {
      const parsed = JSON.parse(description);
      return parsed.garmin;
    } catch (e) {
      return null;
    }
  }, [description]);

  return (
    <div className="space-x-2 justify-self-end">
      {
        garmin && (
          <a
            href={`https://connect.garmin.com/modern/course/${garmin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-secondary text-primary text-sm rounded-lg hover:bg-secondary/90 transition-colors"
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
            className="inline-block px-4 py-2 bg-secondary text-primary text-sm rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Bekijk startlocatie
          </a>
        )
      }
    </div>
  );
};
