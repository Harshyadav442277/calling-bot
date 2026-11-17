export type BusinessType = "salon" | "clinic";

export type AppointmentStatus = "confirmed" | "completed" | "cancelled" | "no-show";

/** How the appointment reached the book. "phone" bookings arrive from the phone line. */
export type AppointmentSource = "phone" | "manual";

/**
 * One appointment. This is the shape the website reads; real booking data
 * should be mapped into it in lib/store.ts, the only data-access module.
 */
export interface Appointment {
  id: string;
  clientName: string;
  phone: string;
  serviceId: string;
  staffId: string;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  /** Local start time, HH:MM (24h). */
  start: string;
  /** Minutes. */
  duration: number;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes?: string;
  /** ISO timestamp of when the booking was made. */
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  /** Staff ids allowed to take this service. Empty = anyone. */
  staff?: string[];
}

export interface Staff {
  id: string;
  name: string;
  role: string;
}

export interface BusinessProfile {
  type: BusinessType;
  label: string;
  defaultName: string;
  client: string;
  clients: string;
  service: string;
  services: string;
  staffRole: string;
  staffRolePlural: string;
  /** Opening hour and closing hour, 24h. */
  open: number;
  close: number;
  /** 0 = Sunday. */
  closedDays: number[];
  staff: Staff[];
  catalogue: Service[];
}
