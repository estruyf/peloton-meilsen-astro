import React, { useState, useEffect } from 'react';
import type { GalleryEvent } from '../models/Gallery';
import { GalleryEventCard } from './GalleryEventCard';
import { getGalleryEvents } from '../lib/galleryUtils';

export const GalleryEventList: React.FC<{ initialEvents?: GalleryEvent[] }> = ({ initialEvents = [] }) => {
  const [events, setEvents] = useState<GalleryEvent[]>(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have events from props, don't fetch again
    if (initialEvents.length > 0) {
      setEvents(initialEvents);
      setLoading(false);
      return;
    }

    async function loadEvents() {
      try {
        setLoading(true);
        const galleryEvents = await getGalleryEvents();
        setEvents(galleryEvents);
      } catch (err) {
        console.error('Error loading gallery events:', err);
        setError('Er is een fout opgetreden bij het laden van de galerij. Probeer het later opnieuw.');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [initialEvents]);

  if (loading) {
    return (
      <div className="grid animate-pulse gap-6 md:grid-cols-2" aria-busy="true">
        <div className="aspect-[4/3] rounded-3xl bg-ink/10 md:col-span-2 md:aspect-[21/9]" />
        <div className="aspect-[4/3] rounded-3xl bg-ink/10" />
        <div className="aspect-[4/3] rounded-3xl bg-ink/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-800">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 p-10 text-center">
        <p className="font-display text-3xl">Nog geen albums</p>
        <p className="mt-2 text-ink/60">Er zijn nog geen foto's toegevoegd aan de galerij.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {events.map((event, i) => (
        <GalleryEventCard key={event.id} event={event} featured={i === 0} />
      ))}
    </div>
  );
};
