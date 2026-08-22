/**
 * Card.jsx — Reusable card container component
 *
 * Props:
 *   title      — optional card heading
 *   children   — card body content
 *   id         — optional HTML id
 */

function Card({ title, children, id }) {
  return (
    <div id={id} className="card">
      {title && <h3 className="card__title">{title}</h3>}
      <div className="card__body">{children}</div>
    </div>
  );
}

export default Card;
