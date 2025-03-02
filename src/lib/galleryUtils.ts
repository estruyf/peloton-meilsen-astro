import type { GalleryEvent } from "../models/Gallery";

// Load gallery events from the static data files
export async function getGalleryEvents(): Promise<GalleryEvent[]> {
  try {
    // This is a special Astro feature that allows us to access data
    // that was generated during the build process
    const modules = import.meta.glob("../data/gallery/*.json", { eager: true });

    const loadedEvents = Object.values(modules).map(
      (module) => module.default || module
    ) as GalleryEvent[];

    // Sort events by date (newest first)
    return loadedEvents.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error("Error loading gallery events:", error);
    return [];
  }
}

// Get a specific gallery event by ID
export async function getGalleryEvent(
  id: string
): Promise<GalleryEvent | undefined> {
  try {
    // First try to find the event in all events
    const events = await getGalleryEvents();
    const event = events.find((event) => event.id === id);

    if (event) {
      return event;
    }

    // If not found, return undefined
    console.warn(`Event with ID ${id} not found`);
    return undefined;
  } catch (error) {
    console.error(`Error getting gallery event ${id}:`, error);
    return undefined;
  }
}

// Read metadata from a specific event
export async function readEventMetadata(
  eventId: string
): Promise<{ title: string; description: string }> {
  try {
    const event = await getGalleryEvent(eventId);

    if (!event) {
      return {
        title: "Onbekend evenement",
        description: "Geen beschrijving beschikbaar",
      };
    }

    return {
      title: event.title,
      description: event.description,
    };
  } catch (error) {
    console.error(`Error reading metadata for event ${eventId}:`, error);
    return {
      title: "Fout bij laden",
      description: "Er is een fout opgetreden bij het laden van de metadata.",
    };
  }
}
