import React, { useEffect } from "react";
import "./espaceBailleur.css";
import { useTranslation } from 'react-i18next';

function EspaceVoyageur() {
  const { t } = useTranslation();

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

  const toEspaceDiscussion = () => {
    window.location.href = "/espaceDiscussion";
}

  return (
    <div>
      <img
        src="/paris-tour-eiffel.jpg"
        alt="bailleur"
        className="banBailleur"
      />
      <h1>{t("espaceVoyageur")}</h1>
      <hr />
      <div className="button-grid">
        <button className="grid-button" onClick={toMesBiens}>
        {t("mesReservation")}
        </button>
        <button className="grid-button" onClick={toMesDoc}>
        {t("docAdminPaiment")}
        </button>
        <button className="grid-button" onClick={toLouerBien}>
        {t("louerBien")}
        </button>
        <button className="grid-button" onClick={toPrestations}>{t("louerSuivreService")}</button>
        <button className="grid-button" onClick={toReport}>{t("signalerProb")}</button>
        <button className="grid-button" onClick={toEspaceDiscussion}>MON ESPACE DISCUSSION</button>
      </div>
    </div>
  );
}

export default EspaceVoyageur;
