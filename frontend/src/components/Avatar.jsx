import { genreColor, initials } from '../utils.js';

// Round badge with the person's initials.
export default function Avatar({ name, size = 36 }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: genreColor(name), fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
