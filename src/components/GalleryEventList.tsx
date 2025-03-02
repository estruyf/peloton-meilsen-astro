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
      <div className="flex justify-center items-center py-20">
        <div className="text-xl text-secondary">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Fout!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-secondary">Er zijn nog geen foto's toegevoegd aan de galerij.</p>
        <p className="text-secondary mt-4">
          Voeg foto's toe door ze in de juiste mappenstructuur te plaatsen in de public/gallery map.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <GalleryEventCard key={event.id} event={event} />
      ))}
    </div>
  );
};