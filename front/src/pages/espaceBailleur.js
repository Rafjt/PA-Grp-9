import React, { useEffect } from "react";
import { BASE_URL } from "../services";
import "./espaceBailleur.css";

function EspaceBailleur() {

    useEffect(() => {
        fetch(BASE_URL + "/getBienReserve", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            });
    }, []);


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
    
    const toEtatDesLieux = () => {
        window.location.href = "/etatDesLieux";
    }

    const toEspaceDiscussion = () => {
        window.location.href = "/espaceDiscussion";
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
                <button className="grid-button" onClick={toEtatDesLieux}>GESTION ÉTAT DES LIEUX</button>
                <button className="grid-button" onClick={toEspaceDiscussion}>MON ESPACE DISCUSSION</button>
            </div>
        </div>
    );
}

export default EspaceBailleur;