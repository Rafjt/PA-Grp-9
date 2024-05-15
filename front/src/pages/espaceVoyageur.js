import React, { useEffect } from "react";
import Cookies from "js-cookie";
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
        <button className="grid-button">
          MES DOCUMENTS ADMINISTRATIF ET PAIEMENTS
        </button>
        <button className="grid-button" onClick={toLouerBien}>
          LOUER UN BIEN
        </button>
        <button className="grid-button" onClick={toPrestations}>LOUER OU SUIVRE UN SERVICE</button>
      </div>
    </div>
  );
}

export default EspaceVoyageur;
