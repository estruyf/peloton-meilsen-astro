import React from 'react';
import type { GalleryEvent } from '../models/Gallery';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';

interface GalleryEventCardProps {
  event: GalleryEvent;
}

export const GalleryEventCard: React.FC<GalleryEventCardProps> = ({ event }) => {
  const formattedDate = event.date
    ? format(new Date(event.date), 'd MMMM yyyy', { locale: nl })
    : '';

  return (
    <a
      href={`/fotogalerij/${event.id}`}
      className="block overflow-hidden rounded-lg shadow-lg bg-light hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={event.coverImage || event.images[0]?.src || '/peloton-meilsen-grijs.svg'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/peloton-meilsen-grijs.svg';
            target.classList.add('p-8');
          }}
        />
      </div>
      <div className="p-4 text-primary">
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        {formattedDate && <p className="text-sm text-gray-600 mb-2">{formattedDate}</p>}
        <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
        <p className="text-sm text-primary mt-2 font-medium">
          {event.images.length} foto's
        </p>
      </div>
    </a>
  );
};