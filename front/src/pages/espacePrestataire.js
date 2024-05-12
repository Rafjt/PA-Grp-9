import React from "react";

function EspacePrestataire() {
    return (
        <div>
        <img
            src="/paris-tour-eiffel.jpg"
            alt="bailleur"
            className="banBailleur"
        />
        <h1>Espace Prestataire</h1>
        <hr />
        <div className="button-grid">
            <button className="grid-button">MES SERVICES</button>
            <button className="grid-button">MES DOCUMENTS ADMINISTRATIF ET PAIEMENTS</button>
            <button className="grid-button">PROPOSER UN SERVICE</button>
            <button className="grid-button">VISUALISER LES RETOURS SUR MES SERVICES</button>
        </div>
        </div>
    );
    }

    export default EspacePrestataire;