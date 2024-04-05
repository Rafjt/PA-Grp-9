import React from 'react';
import './backOffice.css'

const backOffice = () => {
    const toUser = () => {
        window.location.replace("./gestionUtilisateur");
    }
    const toAnnonce = () => {
        window.location.replace("./gestionAnnonce");
    }

    return (
        <div className="backoffice">
            <div className='greet'>
                <h1>Bonjour</h1>
                <h2>Bienvenue sur le tableau de bord</h2>
            </div>
            <div className="buttons">
                <button onClick={toAnnonce}>Gestion des Annonces</button>
                <button onClick={toUser}>Gestion des Utilisateurs</button>
                <button>Gestion des Réservations</button>
                <button>Gestion des Paiements</button>
                <button>Statistiques et rapports</button>
            </div>
        </div>
    );
};

export default backOffice;