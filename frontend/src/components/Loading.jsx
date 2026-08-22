/**
 * Loading.jsx — Reusable loading spinner component
 *
 * Props:
 *   message — optional label below the spinner (default: 'Loading...')
 */

function Loading({ message = 'Loading...' }) {
  return (
    <div id="loading-indicator" className="loading">
      <div className="loading__spinner" aria-label="Loading" role="status" />
      <p className="loading__message">{message}</p>
    </div>
  );
}

export default Loading;
