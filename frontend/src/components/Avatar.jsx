import './Avatar.css';

// Colores derivados de la paleta de marca (ver index.css). Se eligen varios
// tonos para poder diferenciar usuarios a simple vista en una lista.
const PALETTE = ['#914721', '#ba491d', '#e65f17', '#a15c2f', '#7a3b1a', '#c76b2e'];

function getInitials(name) {
	const words = (name || '').trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return '?';
	const first = words[0][0];
	const last = words.length > 1 ? words[words.length - 1][0] : '';
	return (first + last).toUpperCase();
}

// Mismo usuario → mismo color siempre (hash simple y determinista sobre el
// identificador que se le pase, normalmente el _id del usuario).
function getColor(seed) {
	const str = String(seed || '');
	let hash = 0;
	for (let i = 0; i < str.length; i += 1) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return PALETTE[Math.abs(hash) % PALETTE.length];
}

// Avatar generado automáticamente a partir del nombre del usuario (iniciales
// del primer y último nombre) sobre un color fijo según su id. A propósito
// no acepta una imagen ni un onClick: el usuario no puede elegirlo ni
// editarlo, siempre se calcula igual a partir de sus datos.
export default function Avatar({ name, seed, size = 40 }) {
	return (
		<div
			className="avatar"
			style={{ width: size, height: size, fontSize: size * 0.4, background: getColor(seed ?? name) }}
			aria-hidden="true"
		>
			{getInitials(name)}
		</div>
	);
}
