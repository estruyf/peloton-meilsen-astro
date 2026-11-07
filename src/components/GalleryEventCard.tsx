import React from 'react';
import type { GalleryEvent } from '../models/Gallery';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';

interface GalleryEventCardProps {
  event: GalleryEvent;
  featured?: boolean;
}

export const GalleryEventCard: React.FC<GalleryEventCardProps> = ({ event, featured = false }) => {
  const formattedDate = event.date
    ? format(new Date(event.date), 'd MMMM yyyy', { locale: nl })
    : '';

  return (
    <a
      href={`/fotogalerij/${event.id}`}
      className={`group relative block overflow-hidden rounded-3xl bg-ink text-paper ${featured ? 'md:col-span-2' : ''}`}
    >
      <div className={`relative overflow-hidden ${featured ? 'aspect-[4/3] md:aspect-[21/9]' : 'aspect-[4/3]'}`}>
        <img
          src={event.coverImage || event.images[0]?.src || '/peloton-meilsen-grijs.svg'}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/peloton-meilsen-grijs.svg';
            target.classList.add('p-8');
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" aria-hidden={true} />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">
          {[formattedDate, `${event.images.length} foto's`].filter(Boolean).join(' · ')}
        </p>
        <h3 className={`font-display mt-2 ${featured ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'}`}>{event.title}</h3>
        {event.description && (
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-paper/75">{event.description}</p>
        )}
      </div>
    </a>
  );
};
