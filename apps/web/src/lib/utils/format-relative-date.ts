const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatRelativeDate(date: Date | string | number): string {
  const d = new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();

  if (diff < 0) {
    return d.toLocaleDateString("da-DK");
  }

  if (diff < MINUTE) {
    return "Lige nu";
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} ${minutes === 1 ? "minut" : "minutter"} siden`;
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} ${hours === 1 ? "time" : "timer"} siden`;
  }

  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `${days} ${days === 1 ? "dag" : "dage"} siden`;
  }

  return d.toLocaleDateString("da-DK");
}
