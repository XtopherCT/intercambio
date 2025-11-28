export default function Card({ children, className = "", hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={"card " + (hover ? "hoverable " : "") + className}
    >
      {children}
    </div>
  );
}
