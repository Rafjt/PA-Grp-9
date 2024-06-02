import React, { useEffect } from "react";
import "./espaceBailleur.css";

function EspaceBailleur() {
    console.log(document.cookie);
    const toMesBiens = () => {
        window.location.href = "/MesBiens";
    }

    const toCreeBien = () => {
        console.log("CreeBien");
        window.location.href = "/creeBien";
    }

    const toPrestations = () => {
        window.location.href = "/prestations";
    }

    const toMesDoc = () => {
        window.location.replace("/mesDocuments");
      }

    const toReport = () => {
        window.location.href = "/report";
    }
    

    return (
        <div>
            <img src="/paris-tour-eiffel.jpg" alt="bailleur" className="banBailleur" />
            <h1>Espace Bailleur</h1>
            <hr />
            <div className="button-grid">
                <button className="grid-button" onClick={toMesBiens}>
                    MES BIENS
                </button>
                <button className="grid-button" onClick={toMesDoc}>
                    MES DOCUMENTS ADMINISTRATIF ET PAIEMENTS
                </button>
                <button className="grid-button"  onClick={toCreeBien}>
                    METTRE EN LOCATION UN BIEN
                </button>
                <button className="grid-button" onClick={toPrestations}>
                    LOUER OU SUIVRE UN SERVICE
                </button>
                <button className="grid-button" onClick={toReport}>SIGNALER UN PROBLÈME</button>
            </div>
        </div>
    );
}

export default EspaceBailleur;