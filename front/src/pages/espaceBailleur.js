import React, { useEffect } from "react";
import "./espaceBailleur.css";

function EspaceBailleur() {
    console.log(document.cookie);
    useEffect(() => {
        fetch('http://localhost:3001/api/biens', { credentials: 'include' }) // include credentials
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            });
    }, []);

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

    return (
        <div>
            <img src="/paris-tour-eiffel.jpg" alt="bailleur" className="banBailleur" />
            <h1>Espace Bailleur</h1>
            <hr />
            <div className="button-grid">
                <button className="grid-button" onClick={toMesBiens}>
                    MES BIENS
                </button>
                <button className="grid-button">
                    MES DOCUMENTS ADMINISTRATIF ET PAIEMENTS
                </button>
                <button className="grid-button"  onClick={toCreeBien}>
                    METTRE EN LOCATION UN BIEN
                </button>
                <button className="grid-button" onClick={toPrestations}>
                    LOUER OU SUIVRE UN SERVICE
                </button>
            </div>
        </div>
    );
}

export default EspaceBailleur;