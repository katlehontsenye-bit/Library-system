// Colours used for genres (dark enough for white text on top).
const GENRE_COLORS = ['#5B4BD6', '#0E8F80', '#E0405A', '#C77700', '#2F6FDB', '#C026A5', '#4D7C0F', '#D9480F'];

// The same genre always gets the same colour.
export function genreColor(genre = '') {
  let hash = 0;
  for (const char of genre.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return GENRE_COLORS[hash % GENRE_COLORS.length];
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export const LOW_STOCK_LIMIT = 2; // "fewer than 2 copies" counts as low stock
