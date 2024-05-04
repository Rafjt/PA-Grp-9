import React, { useEffect } from "react";
import Cookies from 'js-cookie';
import "./espaceBailleur.css";


console.log(Cookies.get('admin')); // replace 'admin' with the name of your cookie
console.log(Cookies.get('id')); // replace 'id' with the name of your cookie
console.log(Cookies.get('type')); // replace 'type' with the name of your cookie

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
                <button className="grid-button">
                    METTRE EN LOCATION UN BIEN
                </button>
                <button className="grid-button">
                    LOUER OU SUIVRE UN SERVICE
                </button>
            </div>
        </div>
    );
}

export default EspaceBailleur;