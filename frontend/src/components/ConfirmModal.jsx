import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ open, title = 'Confirmar', message, onConfirm, onCancel, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar' }) {
  if (!open) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-outline" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
