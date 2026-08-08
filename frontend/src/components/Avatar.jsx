import './Avatar.css';

function getInitials(name) {
	const words = (name || '').trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return '?';
	const first = words[0][0];
	const last = words.length > 1 ? words[words.length - 1][0] : '';
	return (first + last).toUpperCase();
}

// Avatar generado automáticamente a partir del nombre del usuario (iniciales
// del primer y último nombre), siempre con el mismo color de marca para
// cualquier usuario — es un solo sistema visual, no una identidad por
// persona. A propósito no acepta imagen ni onClick: el usuario no puede
// elegirlo ni editarlo, siempre se calcula igual a partir de su nombre.
export default function Avatar({ name, size = 40 }) {
	return (
		<div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden="true">
			{getInitials(name)}
		</div>
	);
}
