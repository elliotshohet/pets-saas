export const calendarEscape = (v: string) =>
  v
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
export function calendarFile(
  tasks: {
    id: string;
    title: string;
    dueDate: Date;
    instructions: string | null;
    intervalDays: number | null;
  }[],
) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pets//Care reminders//EN',
    'CALSCALE:GREGORIAN',
  ];
  for (const task of tasks) {
    const date = task.dueDate.toISOString().slice(0, 10).replaceAll('-', '');
    const end = new Date(task.dueDate);
    end.setUTCDate(end.getUTCDate() + 1);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${task.id}@pets.local`,
      `DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '')}`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replaceAll('-', '')}`,
      `SUMMARY:${calendarEscape(task.title)}`,
      `DESCRIPTION:${calendarEscape(task.instructions || 'User-entered care reminder')}`,
      ...(task.intervalDays ? [`RRULE:FREQ=DAILY;INTERVAL=${task.intervalDays}`] : []),
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  // Fold UTF-8 content lines to the iCalendar 75-octet limit without splitting characters.
  return (
    lines
      .map((line) => {
        let out = '',
          length = 0;
        for (const char of line) {
          const bytes = Buffer.byteLength(char);
          if (length + bytes > 75) {
            out += '\r\n ';
            length = 1;
          }
          out += char;
          length += bytes;
        }
        return out;
      })
      .join('\r\n') + '\r\n'
  );
}
