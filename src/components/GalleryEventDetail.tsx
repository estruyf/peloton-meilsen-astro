import React, { useState, useEffect } from 'react';
import type { GalleryEvent } from '../models/Gallery';
import { Gallery } from './Gallery';
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
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-ink/60">Laden…</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div role="alert" className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-800">
        <p className="font-semibold">{error || 'Evenement niet gevonden'}</p>
        <a href="/fotogalerij" className="mt-3 inline-block font-semibold underline underline-offset-4">Terug naar de galerij</a>
      </div>
    );
  }

  return <Gallery images={event.images} />;
};
