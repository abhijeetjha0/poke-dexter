export default function MaterialIcon({ icon, className = '' }) {
    return <span className={`material-symbols-outlined ${className}`.trim()}>{icon}</span>;
}
