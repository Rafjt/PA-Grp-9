import React, { useEffect } from "react";
import "./espaceBailleur.css";

function EspaceVoyageur() {
  console.log(document.cookie);
  const toMesBiens = () => {
    window.location.replace("/mesReservations");
  };

  const toLouerBien = () => {
    window.location.replace("/Biens");
  };

  const toPrestations = () => {
    window.location.replace("/prestations");
  }

  const toMesDoc = () => {
    window.location.replace("/mesDocuments");
  }

  const toReport = () => {
    window.location.replace("/report");
  }

  return (
    <div>
      <img
        src="/paris-tour-eiffel.jpg"
        alt="bailleur"
        className="banBailleur"
      />
      <h1>Espace Voyageur</h1>
      <hr />
      <div className="button-grid">
        <button className="grid-button" onClick={toMesBiens}>
          MES RESERVATIONS
        </button>
        <button className="grid-button" onClick={toMesDoc}>
          MES DOCUMENTS ADMINISTRATIF ET PAIEMENTS
        </button>
        <button className="grid-button" onClick={toLouerBien}>
          LOUER UN BIEN
        </button>
        <button className="grid-button" onClick={toPrestations}>LOUER OU SUIVRE UN SERVICE</button>
        <button className="grid-button" onClick={toReport}>SIGNALER UN PROBLÈME</button>
      </div>
    </div>
  );
}

export default EspaceVoyageur;
