import React, { useEffect } from "react";
import { BASE_URL } from "../services";
import "./espaceBailleur.css";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    return (
        <div>
            <img src="/paris-tour-eiffel.jpg" alt="bailleur" className="banBailleur" />
            <h1>{t('espaceBailleur')}</h1>
            <hr />
            <div className="button-grid">
                <button className="grid-button" onClick={toMesBiens}>
                    {t('mesBiens')}
                </button>
                <button className="grid-button" onClick={toMesDoc}>
                    {t('mesDocuments')}
                </button>
                <button className="grid-button" onClick={toCreeBien}>
                    {t('mettreEnLocation')}
                </button>
                <button className="grid-button" onClick={toPrestations}>
                    {t('louerService')}
                </button>
                <button className="grid-button" onClick={toReport}>
                    {t('signalerProbleme')}
                </button>
                <button className="grid-button" onClick={toEtatDesLieux}>
                    {t('gestionEtatDesLieux')}
                </button>
                <button className="grid-button" onClick={toEspaceDiscussion}>
                    {t('monEspaceDiscussion')}
                </button>
            </div>
        </div>
    );
}

export default EspaceBailleur;