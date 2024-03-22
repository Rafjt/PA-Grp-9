import React from 'react';
import './backOffice.css'

const backOffice = () => {
    const myFunction = () => {
        window.location.replace("./gestionUtilisateur");
    }

    return (
        <div className="backoffice">
            <div className='greet'>
                <h1>Bonjour</h1>
                <h2>Bienvenue sur le tableau de bord</h2>
            </div>
            <div className="buttons">
                <button>Gestion des Annonces</button>
                <button onClick={myFunction}>Gestion des Utilisateurs</button>
                <button>Gestion des Réservations</button>
                <button>Gestion des Paiements</button>
                <button>Statistiques et rapports</button>
            </div>
        </div>
    );
};

export default backOffice;