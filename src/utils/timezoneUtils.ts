/**
 * Timezone and Calling Window Safety Utilities
 *
 * Automatically detects prospect timezone based on location or phone dialing code,
 * calculates current local time, and evaluates if the prospect is within standard
 * enterprise calling hours (9:00 AM - 6:00 PM local time).
 */

export interface CallingWindowStatus {
  status: 'optimal' | 'caution' | 'restricted';
  label: string;
  localTimeFormatted: string;
  localDateFormatted: string;
  timezone: string;
  timezoneAbbr: string;
  isSafeToCall: boolean;
  requiresOverride: boolean;
  reason: string;
  badgeClass: string;
}

// Common city / state / region to IANA Timezone mapping
const LOCATION_TIMEZONE_MAP: Record<string, string> = {
  // United States & Canada
  'san francisco': 'America/Los_Angeles',
  'los angeles': 'America/Los_Angeles',
  'seattle': 'America/Los_Angeles',
  'california': 'America/Los_Angeles',
  'ca': 'America/Los_Angeles',
  'denver': 'America/Denver',
  'colorado': 'America/Denver',
  'chicago': 'America/Chicago',
  'austin': 'America/Chicago',
  'dallas': 'America/Chicago',
  'houston': 'America/Chicago',
  'texas': 'America/Chicago',
  'tx': 'America/Chicago',
  'illinois': 'America/Chicago',
  'new york': 'America/New_York',
  'boston': 'America/New_York',
  'miami': 'America/New_York',
  'atlanta': 'America/New_York',
  'ny': 'America/New_York',
  'massachusetts': 'America/New_York',
  'florida': 'America/New_York',
  'toronto': 'America/Toronto',
  'vancouver': 'America/Vancouver',
  'usa': 'America/New_York',
  'united states': 'America/New_York',

  // India
  'bengaluru': 'Asia/Kolkata',
  'bangalore': 'Asia/Kolkata',
  'mumbai': 'Asia/Kolkata',
  'delhi': 'Asia/Kolkata',
  'new delhi': 'Asia/Kolkata',
  'hyderabad': 'Asia/Kolkata',
  'pune': 'Asia/Kolkata',
  'chennai': 'Asia/Kolkata',
  'ahmedabad': 'Asia/Kolkata',
  'surat': 'Asia/Kolkata',
  'gujarat': 'Asia/Kolkata',
  'maharashtra': 'Asia/Kolkata',
  'karnataka': 'Asia/Kolkata',
  'india': 'Asia/Kolkata',

  // United Kingdom & Europe
  'london': 'Europe/London',
  'uk': 'Europe/London',
  'united kingdom': 'Europe/London',
  'manchester': 'Europe/London',
  'paris': 'Europe/Paris',
  'france': 'Europe/Paris',
  'berlin': 'Europe/Berlin',
  'munich': 'Europe/Berlin',
  'frankfurt': 'Europe/Berlin',
  'germany': 'Europe/Berlin',
  'amsterdam': 'Europe/Amsterdam',
  'netherlands': 'Europe/Amsterdam',
  'zurich': 'Europe/Zurich',
  'switzerland': 'Europe/Zurich',
  'dublin': 'Europe/Dublin',
  'ireland': 'Europe/Dublin',

  // Asia Pacific
  'tokyo': 'Asia/Tokyo',
  'japan': 'Asia/Tokyo',
  'singapore': 'Asia/Singapore',
  'hong kong': 'Asia/Hong_Kong',
  'sydney': 'Australia/Sydney',
  'melbourne': 'Australia/Sydney',
  'australia': 'Australia/Sydney',
  'dubai': 'Asia/Dubai',
  'uae': 'Asia/Dubai',
};

// Phone prefix to Timezone mapping
const PHONE_PREFIX_MAP: Array<{ prefix: string; timezone: string }> = [
  { prefix: '+91', timezone: 'Asia/Kolkata' },
  { prefix: '+44', timezone: 'Europe/London' },
  { prefix: '+81', timezone: 'Asia/Tokyo' },
  { prefix: '+65', timezone: 'Asia/Singapore' },
  { prefix: '+971', timezone: 'Asia/Dubai' },
  { prefix: '+61', timezone: 'Australia/Sydney' },
  { prefix: '+49', timezone: 'Europe/Berlin' },
  { prefix: '+33', timezone: 'Europe/Paris' },
  { prefix: '+1', timezone: 'America/New_York' }, // General US fallback
];

/**
 * Resolves the most appropriate IANA timezone for a lead based on location and phone number.
 */
export function getProspectTimezone(location?: string, phone?: string): string {
  if (location) {
    const locLower = location.toLowerCase().trim();
    
    // Check direct matches and substring matches
    for (const [key, tz] of Object.entries(LOCATION_TIMEZONE_MAP)) {
      if (locLower.includes(key)) {
        return tz;
      }
    }
  }

  if (phone) {
    const cleanedPhone = phone.trim();
    for (const mapping of PHONE_PREFIX_MAP) {
      if (cleanedPhone.startsWith(mapping.prefix)) {
        return mapping.timezone;
      }
    }
  }

  // Default to system local timezone or Asia/Kolkata (IST)
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

/**
 * Evaluates whether the prospect is in their business hours calling window.
 */
export function getCallingWindowStatus(timezone: string): CallingWindowStatus {
  try {
    const now = new Date();

    // Format local time in prospect's timezone
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });

    // Timezone abbreviation formatter
    const tzNameFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });

    const localTimeFormatted = timeFormatter.format(now);
    const localDateFormatted = dateFormatter.format(now);
    const hourNumber = parseInt(hourFormatter.format(now), 10);
    const tzParts = tzNameFormatter.formatToParts(now);
    const tzPart = tzParts.find((p) => p.type === 'timeZoneName');
    const timezoneAbbr = tzPart ? tzPart.value : timezone.split('/').pop() || timezone;

    // Check weekday: Sunday is weekend, Saturday is off-peak
    const weekdayFull = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(now);
    const isSunday = weekdayFull === 'Sunday';
    const isSaturday = weekdayFull === 'Saturday';

    // Business Hours Logic:
    // Optimal: 9:00 AM (09:00) to 6:00 PM (18:00), Monday - Friday
    // Caution: 8:00 AM - 9:00 AM, 6:00 PM - 8:00 PM (or Saturday 10:00 AM - 4:00 PM)
    // Restricted: 8:00 PM - 8:00 AM (Night time), or Sunday

    if (isSunday) {
      return {
        status: 'restricted',
        label: `Sunday Rest (${localTimeFormatted})`,
        localTimeFormatted,
        localDateFormatted,
        timezone,
        timezoneAbbr,
        isSafeToCall: false,
        requiresOverride: true,
        reason: 'Prospect is on weekend break. Sunday calls risk low answer rate and poor customer experience.',
        badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30',
      };
    }

    if (hourNumber >= 20 || hourNumber < 8) {
      // 8:00 PM to 8:00 AM -> Night time
      return {
        status: 'restricted',
        label: `Night Hours (${localTimeFormatted})`,
        localTimeFormatted,
        localDateFormatted,
        timezone,
        timezoneAbbr,
        isSafeToCall: false,
        requiresOverride: true,
        reason: `Local time is ${localTimeFormatted} (${timezoneAbbr}). Calling between 8:00 PM and 8:00 AM may violate regulatory quiet hours (TCPA/TRAI) or disturb the prospect.`,
        badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30',
      };
    }

    if (isSaturday) {
      return {
        status: 'caution',
        label: `Saturday Hours (${localTimeFormatted})`,
        localTimeFormatted,
        localDateFormatted,
        timezone,
        timezoneAbbr,
        isSafeToCall: true,
        requiresOverride: false,
        reason: 'Weekend business hours. Many decision-makers have limited commercial availability.',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      };
    }

    if ((hourNumber >= 8 && hourNumber < 9) || (hourNumber >= 18 && hourNumber < 20)) {
      // Early morning (8-9 AM) or evening (6-8 PM)
      return {
        status: 'caution',
        label: `Off-Peak Hours (${localTimeFormatted})`,
        localTimeFormatted,
        localDateFormatted,
        timezone,
        timezoneAbbr,
        isSafeToCall: true,
        requiresOverride: false,
        reason: `Local time is ${localTimeFormatted} (${timezoneAbbr}). Outside core 9 AM–6 PM window. Exercise agent discretion.`,
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      };
    }

    // Optimal business hours: 9:00 AM to 6:00 PM
    return {
      status: 'optimal',
      label: `Optimal Window (${localTimeFormatted})`,
      localTimeFormatted,
      localDateFormatted,
      timezone,
      timezoneAbbr,
      isSafeToCall: true,
      requiresOverride: false,
      reason: `Local time is ${localTimeFormatted} (${timezoneAbbr}). Inside active business hours.`,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };
  } catch (error) {
    return {
      status: 'optimal',
      label: 'Standard Hours',
      localTimeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      localDateFormatted: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      timezone,
      timezoneAbbr: 'LOCAL',
      isSafeToCall: true,
      requiresOverride: false,
      reason: 'Standard calling hours detected.',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };
  }
}
