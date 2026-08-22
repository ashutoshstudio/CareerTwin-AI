/**
 * Button.jsx — Reusable button component
 *
 * Props:
 *   children   — button label
 *   onClick    — click handler
 *   type       — 'button' | 'submit' | 'reset'  (default: 'button')
 *   variant    — 'primary' | 'secondary' | 'danger'  (default: 'primary')
 *   disabled   — boolean (default: false)
 *   id         — optional HTML id
 */

function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  id,
}) {
  return (
    <button
      id={id}
      type={type}
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
