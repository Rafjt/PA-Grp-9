import React from 'react';
import './backOffice.css'
import { Link, NavLink } from 'react-router-dom';

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
    const toStat = () => {
        window.location.replace("./statistiques");
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
                <button>Gestion des Paiements</button>
                <button onClick={toStat}>Statistiques et rapports</button>
            </div>
        </div>
    );
};

export default backOffice;