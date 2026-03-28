import { PUBLIC_LANGUAGE, PUBLIC_TIMEZONE } from '$env/static/public';

export function formatRelativeDate(date: Date): { date: string; time: string } {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffS = Math.floor(diffMs / 1000);
  const diffM = Math.floor(diffS / 60);
  const diffH = Math.floor(diffM / 60);
  const diffD = Math.floor(diffH / 24);

  const rtf = new Intl.RelativeTimeFormat(PUBLIC_LANGUAGE, { numeric: 'auto' });

  if (diffH < 1) return { date: rtf.format(0, 'day'), time: rtf.format(-diffM, 'minute') };
  if (diffD < 1) return { date: rtf.format(0, 'day'), time: rtf.format(-diffH, 'hour') };

  const timeZone = PUBLIC_TIMEZONE || undefined;
  const time = new Intl.DateTimeFormat(PUBLIC_LANGUAGE, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
    timeZone,
  })
    .format(date)
    .replace(/\bAM\b/, 'a.m.')
    .replace(/\bPM\b/, 'p.m.');

  if (diffD === 1) {
    return { date: rtf.format(-1, 'day'), time };
  }

  if (diffD <= 3) {
    return { date: rtf.format(-diffD, 'day'), time };
  }

  return {
    date: new Intl.DateTimeFormat(PUBLIC_LANGUAGE, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date),
    time,
  };
}
