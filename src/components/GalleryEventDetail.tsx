import React, { useState, useEffect } from 'react';
import type { GalleryEvent } from '../models/Gallery';
import { Gallery } from './Gallery';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale/nl';
import { getGalleryEvent } from '../lib/galleryUtils';

interface GalleryEventDetailProps {
  eventId: string;
  initialEvent?: GalleryEvent;
}

export const GalleryEventDetail: React.FC<GalleryEventDetailProps> = ({
  eventId,
  initialEvent = null
}) => {
  const [event, setEvent] = useState<GalleryEvent | null>(initialEvent);
  const [loading, setLoading] = useState(!initialEvent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have the event from props, don't fetch again
    if (initialEvent) {
      setEvent(initialEvent);
      setLoading(false);
      return;
    }

    async function loadEvent() {
      try {
        setLoading(true);
        const eventData = await getGalleryEvent(eventId);

        if (!eventData) {
          setError('Evenement niet gevonden');
          return;
        }

        setEvent(eventData);
      } catch (err) {
        console.error('Error loading gallery event:', err);
        setError('Er is een fout opgetreden bij het laden van het evenement. Probeer het later opnieuw.');
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId, initialEvent]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-xl text-secondary">Laden...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Fout!</strong>
        <span className="block sm:inline"> {error || 'Evenement niet gevonden'}</span>
        <div className="mt-4">
          <a href="/fotogalerij" className="text-primary underline">Terug naar galerij</a>
        </div>
      </div>
    );
  }

  const formattedDate = event.date
    ? format(new Date(event.date), 'd MMMM yyyy', { locale: nl })
    : '';

  return (
    <div className="container mx-auto py-8 md:py-20">
      <div className="mb-8">
        <a href="/fotogalerij" className="text-secondary hover:text-secondary/80 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Terug naar galerij
        </a>
      </div>

      <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
      {formattedDate && <p className="text-xl text-secondary mb-4">{formattedDate}</p>}
      <p className="text-xl text-secondary max-w-2xl mb-8">{event.description}</p>

      <Gallery images={event.images} />
    </div>
  );
};