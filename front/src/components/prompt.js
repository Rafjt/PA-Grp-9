import React, { useState } from "react";
import "./prompt.css";

const Prompt = ({ message, onConfirm, onCancel }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleConfirm = () => {
    setIsOpen(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    isOpen && (
      <div className="prompt">
        <div className="prompt-overlay" />
        <div className="prompt-box">
          <div className="prompt-message">{message}</div>
          <div className="prompt-buttons">
            <button className="prompt-confirm" onClick={handleConfirm}>
              Confirmer
            </button>
            <button className="prompt-cancel" onClick={handleCancel}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Prompt;
