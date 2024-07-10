import React, { useEffect, useState } from "react";
import { validatePrestataire } from "../services";
import MyPrestations from "./myPrestations";
import { useTranslation } from "react-i18next";

function EspacePrestataire() {
  const [isValid, setIsValid] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    validatePrestataire().then((data) => {
      setIsValid(data.valide === 1);
    });
  }, []);

  if (isValid === null) {
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #f5c6cb",
          marginBottom: "25%",
          marginTop: "25%",
        }}
      >
        <h1 style={{ fontSize: "1.5em", margin: "0" }}>
          Votre compte n'est pas encore validé.
        </h1>
        <h2 style={{ fontSize: "1.2em", margin: "0" }}>
          Veuillez attendre que l'administrateur valide votre compte.
        </h2>
        <img
          src="/Lock.png"
          alt="warning"
          style={{ width: "100px", margin: "20px 0" }}
        />
      </div>
    );
  }

  const toMePlacer = () => {
    window.location.href = "/MePlacer";
  };

  const toMyPrestations = () => {
    window.location.href = "/MyPrestations";
  };

  const toMesPerformances = () => {
    window.location.href = "/perfPresta";
  };

  const toReport = () => {
    window.location.href = "/report";
  };

  const toMesDoc = () => {
    window.location.replace("/mesDocuments");
  };

  const toMesDomaines = () => {
    window.location.href = "/mesDomaines";
  };

  const toEspaceDiscussion = () => {
    window.location.href = "/espaceDiscussion";
  };

  return (
    <div>
      <img
        src="/paris-tour-eiffel.jpg"
        alt="bailleur"
        className="banBailleur"
      />
      <h1>{t("espacePrestataire")}</h1>
      <hr />
      <div className="button-grid">
        <button className="grid-button" onClick={toMesPerformances}>
          {t("mesPerformances")}
        </button>
        <button className="grid-button" onClick={toMesDoc}>
          {t("mesDocuments")}
        </button>
        <button className="grid-button" onClick={toMePlacer}>
          {t("mePlacer")}
        </button>
        <button className="grid-button" onClick={toMesDomaines}>
          {t("mesSecteurs")}
        </button>
        <button className="grid-button" onClick={toMyPrestations}>
          {t("mesPrestations")}
        </button>
        <button className="grid-button" onClick={toReport}>
          {t("signalerProbleme")}
        </button>
        <button className="grid-button" onClick={toEspaceDiscussion}>
          {t("monEspaceDiscussion")}
        </button>
      </div>
    </div>
  );
}

export default EspacePrestataire;
