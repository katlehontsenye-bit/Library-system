// Shows an error or success message; renders nothing when there is no text.
export default function Message({ type = 'error', text }) {
  if (!text) return null;
  return <div className={`message message-${type}`} role="alert">{text}</div>;
}
