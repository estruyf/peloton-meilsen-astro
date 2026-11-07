export interface RideGroup {
  label: string;
  distance?: string;
  gpxUrl?: string;
}

export interface RideEvent {
  id: string;
  title: string;
  /** Local date-time string, e.g. 2027-03-07T08:30:00 */
  start: string;
  hasStartTime: boolean;
  location?: string;
  type?: "ride" | "social" | string;
  groups: RideGroup[];
}
