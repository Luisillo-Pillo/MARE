import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './ActionsMenu.css';

function MenuIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

// Botón "..." que despliega un panel de acciones. El panel se renderiza en
// un portal (document.body) y se posiciona con las coordenadas del botón:
// así no lo recorta el overflow:hidden/auto de la tabla que lo contiene.
// Solo un menú puede estar abierto a la vez porque el estado "open" lo
// controla el componente padre (ver Clients.jsx).
export default function ActionsMenu({ open, onToggle, onClose, label = 'Acciones', children }) {
	const triggerRef = useRef(null);
	const dropdownRef = useRef(null);
	const [position, setPosition] = useState(null);

	useLayoutEffect(() => {
		if (!open || !triggerRef.current) {
			setPosition(null);
			return;
		}
		const rect = triggerRef.current.getBoundingClientRect();
		setPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;

		function handlePointerDown(e) {
			if (triggerRef.current?.contains(e.target) || dropdownRef.current?.contains(e.target)) return;
			onClose();
		}
		function handleKeyDown(e) {
			if (e.key === 'Escape') onClose();
		}
		// Si la tabla o la página se desplazan, el botón ya no está donde se
		// calculó la posición del panel: lo más simple y confiable es cerrarlo.
		function handleScrollOrResize() {
			onClose();
		}

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);
		window.addEventListener('scroll', handleScrollOrResize, true);
		window.addEventListener('resize', handleScrollOrResize);
		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('scroll', handleScrollOrResize, true);
			window.removeEventListener('resize', handleScrollOrResize);
		};
	}, [open, onClose]);

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				className="actions-menu-trigger"
				onClick={onToggle}
				aria-haspopup="true"
				aria-expanded={open}
				aria-label={label}
			>
				<MenuIcon />
			</button>
			{open && position &&
				createPortal(
					<div
						ref={dropdownRef}
						className="actions-menu-dropdown"
						role="menu"
						style={{ top: position.top, right: position.right }}
					>
						{children}
					</div>,
					document.body
				)}
		</>
	);
}
