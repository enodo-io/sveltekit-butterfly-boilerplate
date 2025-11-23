import { PUBLIC_LANGUAGE } from '$env/static/public';

export function formatRelativeDate(date: Date): { date: string; time: string } {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffS = Math.floor(diffMs / 1000);
  const diffM = Math.floor(diffS / 60);
  const diffH = Math.floor(diffM / 60);
  const diffD = Math.floor(diffH / 24);

  const rtf = new Intl.RelativeTimeFormat(PUBLIC_LANGUAGE, { numeric: 'auto' });

  if (diffH < 1) return { date: 'Today', time: rtf.format(-diffM, 'minute') };
  if (diffD < 1) return { date: 'Today', time: rtf.format(-diffH, 'hour') };

  const time = new Intl.DateTimeFormat(PUBLIC_LANGUAGE, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
    timeZone: 'America/New_York',
  })
    .format(date)
    .replace(/\bAM\b/, 'a.m.')
    .replace(/\bPM\b/, 'p.m.');

  if (diffD === 1) {
    return { date: 'Yesterday', time };
  }

  if (diffD <= 3) {
    return { date: `${diffD} days ago`, time };
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
