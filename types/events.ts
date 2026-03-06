/**
 * ──────────────────────────────────────────────────────────────
 * Event Types — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Type definitions for events, invitations, schedule items,
 * and the event legend.
 */

/** A current/upcoming event with optional countdown */
export interface MockEvent {
  id: number
  title: string
  time: string
  color: string // tailwind color class
  countdown?: string
}

/** An event invitation with date and time */
export interface MockInvitation {
  id: number
  title: string
  date: string
  time: string
  color: string
}

/** A scheduled event block in the day timeline */
export interface MockScheduleEvent {
  id: number
  title: string
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  color: string
  textColor: string
}

/** A single entry in the color-coded event legend */
export interface MockEventLegendItem {
  label: string
  color: string
}
