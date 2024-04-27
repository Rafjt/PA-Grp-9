import React from 'react';
import './backOffice.css'

const backOffice = () => {
    const toUser = () => {
        window.location.replace("./gestionUtilisateur");
    }
    const toAnnonce = () => {
        window.location.replace("./gestionAnnonce");
    }
    const toRes = () => {
        window.location.replace("./gestionReservations");
    }
    const toPaiement = () => {
        window.location.replace("./gestionPaiement");
    }
    const toStats = () => {
        window.location.replace('./statistiques');
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
                <button onClick={toRes}>Gestion des Réservations</button>
                <button onClick={toPaiement}>Gestion des Paiements</button>
                <button onClick={toStats}>Statistiques et rapports</button>
            </div>
        </div>
    );
};

export default backOffice;