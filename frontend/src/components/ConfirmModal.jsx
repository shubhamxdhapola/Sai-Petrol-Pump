import React from 'react';
import Modal from './Modal';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Delete', isDanger = true }) {
  const footer = (
    <>
      <button type="button" onClick={onCancel} className="btn-secondary">
        Cancel
      </button>
      <button 
        type="button" 
        onClick={onConfirm} 
        className={isDanger ? "btn-primary bg-red-600 hover:bg-red-700 border-red-600 focus:ring-red-500" : "btn-primary"}
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal open={open} onClose={onCancel} title={title} footer={footer}>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {isDanger && (
          <div className="shrink-0 rounded-full bg-red-100 p-3 text-red-600">
            <FiAlertTriangle className="text-2xl" />
          </div>
        )}
        <p className="text-ink mt-2">{message}</p>
      </div>
    </Modal>
  );
}
