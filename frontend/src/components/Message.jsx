/** Shows a success or error banner. Renders nothing when there is no text. */
export default function Message({ type = 'error', children }) {
  if (!children) return null;
  return <div className={`message message-${type}`} role="alert">{children}</div>;
}
