import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./promptChoix.css";

const PromptChoix = ({ show, handleClose, handleSelection }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Choisir une option d'abonnement</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Veuillez choisir une option:</p>
        <div className="button-group">
          <Button variant="primary" onClick={() => handleSelection('monthly')} className="mr-2">
            Mensuel
          </Button>
          <Button variant="secondary" onClick={() => handleSelection('annual')}>
            Annuel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PromptChoix;
