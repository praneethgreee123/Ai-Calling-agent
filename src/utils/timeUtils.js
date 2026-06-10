export function timeToSec(t) {
  const [h, m, s] = t.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

export function secToTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function calcDuration(start, end) {
  return secToTime(timeToSec(end) - timeToSec(start));
}

export function formatDate(d) {
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${day} ${months[parseInt(m) - 1]} ${y}`;
}

export function formatDateLong(d) {
  const [y, m, day] = d.split('-');
  const months = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}, ${y}`;
}
