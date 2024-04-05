import React, { useState, useEffect } from 'react';
import './gestionReservations.css';
import "bootstrap/dist/css/bootstrap.min.css";

const GestionReservations = () => {
    const [reservations, setReservations] = useState({
        voyageurs: [],
        clientsbailleurs: [],
        prestataires: [],
        nomBien: [],
    });

    // recherche/filtrage
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState({
     id_BienImmobilier: '',
     id_ClientVoyageur: '',
     dateDebut: '',
     dateFin: '',
     statut: '',
     id_ClientBailleur: '',
     prix: '',
     nomBien: '',
     description: '',
    });

    useEffect(() => {
        fetch('http://localhost:3001/api/reservations')
            .then(response => response.json())
            .then(data => setReservations(data))
            .catch(error => console.error('Error fetching reservations:', error));
    }, []);

    const handleDelete = () => {};

    const handleModify = () => {};

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="gestionReservations">
            <div className="greet">
                <h1>Gestion des Réservations</h1>
                <h2>Ici, vous pouvez consulter, créer, mettre à jour ou annuler des réservations</h2>
            </div>
            <input type="text" placeholder="Rechercher (Nom/prénom)" onChange={handleSearch} />
            <div className="reservationsContainer">
                {Object.values(reservations)
                    .flat()
                    .filter(reservation =>
                        reservation.Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        reservation.Prenom.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(reservation => (
                        <div key={reservation.ID_Reservation} className="reservation">
                            <h3>ID: {reservation.ID_Reservation}</h3>
                            <p>ID du Bien Immobilier: {reservation.ID_BienImmobilier}</p>
                            <p>Date de début : {reservation.DateDebut}</p>
                            <p>Date de fin : {reservation.DateFin}</p>
                            <p>Statut: {reservation.Statut}</p>
                            {/* Fetch details of associated BienImo */}
                            {fetch(`http://localhost:3001/api/bienimo/${reservation.ID_BienImmobilier}`)
                                .then(response => response.json())
                                .then(bienImo => (
                                    <div>
                                        <p>Votre Bien: {bienImo.NomBien}</p>
                                        <p>Prix: {bienImo.prix}</p>
                                    </div>
                                ))}
                            <button onClick={() => handleDelete(reservation.ID_Reservation)}>
                                Supprimer
                            </button>
                            <button onClick={() => handleModify(reservation.ID_Reservation)}>
                                Modifier
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default GestionReservations;