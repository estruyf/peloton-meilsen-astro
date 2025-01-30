export interface CalendarEvents {
  kind: string;
  etag: string;
  summary: string;
  description: string;
  updated: string;
  timeZone: string;
  accessRole: string;
  defaultReminders: any[];
  nextSyncToken: string;
  items: Event[];
}

export interface Event {
  kind: string;
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  description: string;
  location: string;
  creator: Creator;
  organizer: Organizer;
  start: Start;
  end: Start;
  recurringEventId: string;
  originalStartTime: Start;
  iCalUID: string;
  sequence: number;
  eventType: string;
}

export interface Start {
  dateTime: string;
  timeZone: string;
}

export interface Organizer {
  email: string;
  displayName: string;
  self: boolean;
}

export interface Creator {
  email: string;
}
