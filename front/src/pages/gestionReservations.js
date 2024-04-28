import React, { useState, useEffect } from 'react';
import './gestionReservations.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';
import { fetchReservation, deleteReservation, updateReservation } from '../services';
//import {UpdateReservation} from './updateReservation'

const BACK_URL = "http://localhost:3001";

/*const Popup = ({ onClose, reservation }) => {
    return (
        <div className="popup">
            <div>
                <p>Modifier la réservation pour: {reservation.nomBien}</p>
                <button onClick={onClose}>Fermer</button>
            </div>
        </div>
    );
};
*/

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
     cheminImg: ''
    });

    useEffect(() => {
        fetch('http://localhost:3001/api/reservation')
            .then(response => response.json())
            .then(data => setReservations(data))
            .catch(error => console.error('Error fetching reservations:', error));
    }, []);

    const handleDelete = (reservationId) => {
        console.log(reservationId);
        deleteReservation(reservationId)
            .then(() => {
                setReservations((prevReservations) => prevReservations.filter(
                    (reservation) => reservation.id !== reservationId
                ));
            })
            .catch((error) => console.error('Error deleting annonce:', error));
    };
/*
    const handleModify = (e) => {
        const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
        setForm({
            ...form,
            [e.target.name]: value,
        });
    };
*/
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const calculateTotalPrice = (price, startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return price * diffDays;
    };

    return (
        <div className="gestionReservations">
            <div className="greet">
                <h1>Gestion des Réservations</h1>
                <h2>Ici, vous pouvez consulter, créer, mettre à jour ou annuler des réservations</h2>
            </div>
            <input type="text" placeholder="Rechercher" onChange={handleSearch} />
            <div className="reservationsContainer">
                {Object.values(reservations)
                    .flat()
                /*    .filter(reservation =>
                        reservation.Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        reservation.Prenom.toLowerCase().includes(searchTerm.toLowerCase())
                        <h5>Prix total: {totalPrice} pour {days} nuits : €</h5>
                    )*/
                    
                    .map(reservation => (
                        <div key={reservation.id} className="reservation">
                        <h3>Votre réservation : </h3>
                        <img src={`${BACK_URL}/uploads/${reservation.cheminImg}`} alt={reservation.nomBien} className='img' />
                        <p>ID du Bien Immobilier : {reservation.id_BienImmobilier}, {reservation.nomBien}</p>
                        <p>ID du Client voyageur : {reservation.id_ClientVoyageur}</p>
                        <h3>Prix par nuit: {reservation.prix}€</h3>
                        <p>Statut : {reservation.statut}</p>
                        <input type="date" name="dateDebut" value={reservation.dateDebut}/>
                        <input type="date" name="dateFin" value={reservation.dateFin} />
                        <div className='equipments'>    
                        <h5>Équipements</h5>
                        <label>
                            Wifi:
                            <input 
                                type="checkbox" 
                                checked={reservation.wifi === 1} 
                                disabled={true}
                            />
                        </label>
                        <label>
                            Cuisine:
                            <input 
                                type="checkbox" 
                                checked={reservation.cuisine === 1} 
                                disabled={true}
                            />
                        </label>
                        <label>
                            Balcon : 
                            <input 
                                type="checkbox" 
                                checked={reservation.balcon === 1} 
                                disabled={true}
                            />
                        </label>
                        <label>
                            Jardin :
                            <input 
                                type="checkbox" 
                                checked={reservation.jardin === 1} 
                                disabled={true}
                            />
                        </label>
                        <label>
                            Parking :
                            <input 
                                type="checkbox" 
                                checked={reservation.parking === 1} 
                                disabled={true}
                            />
                        </label>
                        <label>
                            Piscine :
                            <input 
                                type="checkbox" 
                                checked={reservation.piscine === 1} 
                                disabled={true}
                            />
                        </label>
                        <label>
                            Jaccuzzi:
                            <input 
                                type="checkbox" 
                                checked={reservation.jaccuzzi === 1} 
                                disabled={true}
                            />
                        </label>
                        <label>
                            Salle de sport :
                            <input 
                                type="checkbox" 
                                checked={reservation.salleDeSport === 1} 
                                disabled={true}
                            />
                        </label>
                        <label>
                            Climatisation :
                            <input 
                                type="checkbox" 
                                checked={reservation.climatisation === 1} 
                                disabled={true}
                            />
                        </label>
                    </div>
                    <br />
                        <Link to={{

                                pathname: `/update/${reservation.id}/reservation`,
                                state: { reservation }, 
                            }}>
                                Modifier la réservation 
                            </Link>
                    <br />        
                    <button onClick={() => handleDelete(reservation.id)}>Annuler la réservation</button>
                    </div>
                    ))}
            </div>
        </div>
    );
};

export default GestionReservations;