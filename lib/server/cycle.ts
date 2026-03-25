const DAY_MS = 24 * 60 * 60 * 1000;

function mondayStart(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setTime(copy.getTime() - diff * DAY_MS);
  return copy;
}

function formatCycleKey(date: Date): string {
  const year = date.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const week = Math.ceil((((date.getTime() - jan1.getTime()) / DAY_MS) + jan1.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function getCurrentCycleInfo(now = new Date()) {
  const monday = mondayStart(now);
  const setupDeadline = new Date(monday);
  setupDeadline.setHours(23, 59, 0, 0);

  const tuesdayNightRun = new Date(monday);
  tuesdayNightRun.setDate(monday.getDate() + 1);
  tuesdayNightRun.setHours(21, 0, 0, 0);

  const meetingWindowStart = new Date(monday);
  meetingWindowStart.setDate(monday.getDate() + 3);
  meetingWindowStart.setHours(0, 0, 0, 0);

  const meetingWindowEnd = new Date(monday);
  meetingWindowEnd.setDate(monday.getDate() + 5);
  meetingWindowEnd.setHours(23, 59, 0, 0);

  return {
    cycleKey: formatCycleKey(monday),
    setupDeadlineISO: setupDeadline.toISOString(),
    matchingRunISO: tuesdayNightRun.toISOString(),
    meetingWindowStartISO: meetingWindowStart.toISOString(),
    meetingWindowEndISO: meetingWindowEnd.toISOString()
  };
}
