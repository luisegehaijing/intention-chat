const DAY_MS = 24 * 60 * 60 * 1000;
const CYCLE_TZ = "America/Chicago";

function formatCycleKey(date: Date): string {
  const year = date.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const week = Math.ceil((((date.getTime() - jan1.getTime()) / DAY_MS) + jan1.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getLocalParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const map = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second)
  };
}

function getOffsetMinutes(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit"
  });
  const part = formatter.formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const match = part.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");
  return sign * (hours * 60 + minutes);
}

function zonedTimeToUtc(
  parts: { year: number; month: number; day: number; hour: number; minute: number; second?: number },
  timeZone: string
) {
  const second = parts.second ?? 0;
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, second);
  let offset = getOffsetMinutes(new Date(utcGuess), timeZone);
  let adjusted = utcGuess - offset * 60_000;
  const offsetAfter = getOffsetMinutes(new Date(adjusted), timeZone);

  if (offsetAfter !== offset) {
    offset = offsetAfter;
    adjusted = utcGuess - offset * 60_000;
  }

  return new Date(adjusted);
}

function mondayStartInChicago(now: Date) {
  const local = getLocalParts(now, CYCLE_TZ);
  const localDate = new Date(Date.UTC(local.year, local.month - 1, local.day));
  const day = localDate.getUTCDay();
  const diff = (day + 6) % 7;
  localDate.setUTCDate(localDate.getUTCDate() - diff);
  return {
    year: localDate.getUTCFullYear(),
    month: localDate.getUTCMonth() + 1,
    day: localDate.getUTCDate()
  };
}

export function getCurrentCycleInfo(now = new Date()) {
  const mondayLocal = mondayStartInChicago(now);
  const mondayForCycle = new Date(mondayLocal.year, mondayLocal.month - 1, mondayLocal.day);

  const setupDeadline = zonedTimeToUtc(
    {
      year: mondayLocal.year,
      month: mondayLocal.month,
      day: mondayLocal.day + 1,
      hour: 23,
      minute: 59,
      second: 0
    },
    CYCLE_TZ
  );

  const tuesdayNightRun = zonedTimeToUtc(
    {
      year: mondayLocal.year,
      month: mondayLocal.month,
      day: mondayLocal.day + 2,
      hour: 0,
      minute: 15,
      second: 0
    },
    CYCLE_TZ
  );

  const meetingWindowStart = zonedTimeToUtc(
    {
      year: mondayLocal.year,
      month: mondayLocal.month,
      day: mondayLocal.day + 3,
      hour: 0,
      minute: 0,
      second: 0
    },
    CYCLE_TZ
  );

  const meetingWindowEnd = zonedTimeToUtc(
    {
      year: mondayLocal.year,
      month: mondayLocal.month,
      day: mondayLocal.day + 5,
      hour: 23,
      minute: 59,
      second: 0
    },
    CYCLE_TZ
  );

  return {
    cycleKey: formatCycleKey(mondayForCycle),
    setupDeadlineISO: setupDeadline.toISOString(),
    matchingRunISO: tuesdayNightRun.toISOString(),
    meetingWindowStartISO: meetingWindowStart.toISOString(),
    meetingWindowEndISO: meetingWindowEnd.toISOString()
  };
}
