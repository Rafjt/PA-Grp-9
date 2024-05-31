import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import './gestionReservations.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';
import { fetchReservation, 
    deleteReservation, 
    createReservation, 
    updateReservation, 
    fetchAnnonceById,
    fetchDisabledDates, 
    fetchReservationById,
    BACK_URL } from '../services';

const GestionReservations = () => {

    const [reservations, setReservations] = useState({
        voyageurs: [],
        clientsbailleurs: [],
        prestataires: [],
        nomBien: [],
    });  

    // recherche/filtrage
   // const [searchTerm, setSearchTerm] = useState('');

    const [searchId, setSearchId] = useState('');

    const [reservationDetails, setReservationDetails] = useState(null);

    const [message, setMessage] = useState('');

    const [arrivee, setArrivee] = useState(new Date());
    const [depart, setDepart] = useState(new Date());
    const [disabledDates, setDisabledDates] = useState([]);
    

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
     cheminImg: '',
     wifi: 0,
     cuisine: 0,
     balcon: 0,
     jardin: 0,
     parking: 0,
     piscine: 0,
     jaccuzzi: 0,
     salleDeSport: 0,
     climatisation: 0
    });

    useEffect(() => {
        fetchReservation()
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
            .catch((error) => console.error('Error deleting reservation:', error));
    };

    const handleSearch = (event) => {
        setSearchId(event.target.value);
    };

    const handleCreateReservation = async () => {
        if (!reservationDetails || !arrivee || !depart) {
            setMessage("Veuillez compléter tous les champs requis.");
            return;
        }
    
        const reservationData = {
            id_BienImmobilier: reservationDetails.id_BienImmobilier,
            id_Voyageur: 'ID_DU_VOYAGEUR', // À remplacer par l'ID réel du client/voyageur
            dateDebut: arrivee.toISOString().substring(0, 10), // format YYYY-MM-DD
            dateFin: depart.toISOString().substring(0, 10), // format YYYY-MM-DD
            prixTotal: calculateTotalPrice(reservationDetails.prix, arrivee, depart)
        };
    
        try {
            const response = await createReservation(reservationData);
            console.log('Réponse de la création de réservation:', response);
            setMessage("Réservation créée avec succès!");
            // Ajoutez ici toute logique supplémentaire post-création
        } catch (error) {
            console.error("Erreur lors de la création de la réservation:", error);
            setMessage("Échec de la création de la réservation.");
        }
    };

    const handleFetchById = async () => {
        if (!searchId.trim()) {
            setMessage("Veuillez entrer un ID valide.");
            setReservationDetails(null);
            return;
        }
    
        try {
            // D'abord, essayez de récupérer les détails du bien non encore réservé
            const annonceData = await fetchAnnonceById(searchId);
            if (annonceData) {
                // Vérifiez si le bien est réservé et les dates ne sont pas disponibles
                const disabledDatesData = await fetchDisabledDates(searchId);
                if (disabledDatesData && disabledDatesData.length) {
                    const isAvailable = !disabledDatesData.some(date =>
                        new Date(date.dateDebut) <= new Date(depart) && new Date(date.dateFin) >= new Date(arrivee)
                    );
                    if (isAvailable) {
                        setReservationDetails(annonceData);
                        setMessage('');
                    } else {
                        setReservationDetails(null);
                        setMessage("Ce bien est déjà réservé pour les dates sélectionnées.");
                    }
                } else {
                    setReservationDetails(annonceData);
                    setMessage('');
                }
            } else {
                // Si aucun bien n'est trouvé, vérifiez s'il est dans les réservations en attente
                const reservationData = await fetchReservationById(searchId);
                if (reservationData) {
                    setReservationDetails(null);
                    setMessage(reservationData.statut === 'Pending' ? "Ce bien est déjà réservé." : "Cette réservation n'est pas disponible pour vos dates.");
                } else {
                    setReservationDetails(null);
                    setMessage("Aucun résultat pour cet ID.");
                }
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de la réservation :", error);
            setReservationDetails(null);
            setMessage("Erreur lors de la récupération de la réservation.");
        }
    };
    
    const calculateTotalPrice = (price, startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return price * diffDays;
    };

    const arr = new Date(form.dateDebut);
    const dep = new Date(form.dateFin);

    const diffTime = Math.abs(dep - arr);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * form.prix;

    return (
        <div className="gestionReservations">
            <div className="greet">
                <h1>Gestion des Réservations</h1>
                <button
            onClick={() => (window.location.href = "/backOffice")}
            className="back-button"
            >
            Retour
            </button>
                <h2>Ici, vous pouvez consulter, créer, mettre à jour ou annuler des réservations</h2>
            </div>

            <div className='reservationCreate'>
                <h2>Créer une réservation</h2>
                <input
                type="number"
                placeholder="Saisir l'ID du bien"
                onChange={handleSearch}
                className='input'
                id='searchBar'
            />
            <div>
            <DatePicker
            selected={arrivee}
            onChange={date => setArrivee(date)}
            selectsStart
            startDate={arrivee}
            endDate={depart}
            minDate={new Date()}
            excludeDates={disabledDates}
            />
            <DatePicker
            selected={depart}
            onChange={date => setDepart(date)}
            selectsEnd
            startDate={arrivee}
            endDate={depart}
            minDate={arrivee}
            excludeDates={disabledDates}
            />
            </div>
            <button type="button" onClick={handleFetchById}>Rechercher</button>
            </div>

            {reservationDetails ? (
            <div className="reservationDetails">
                <h3>Détails de la réservation :</h3>
                <img className="photoDuBien" src={`${BACK_URL}/uploads/${reservationDetails.cheminImg}`} alt={reservationDetails.nomBien} />
                <p>Nom du bien: {reservationDetails.nomBien}</p>
                <p>Prix par nuit: {reservationDetails.prix}€</p>
                <div className='equipments'>
                    <h5>Équipements:</h5>
                    <label>
                    Wifi :
                    <input type="checkbox" checked={reservationDetails.wifi === 1} disabled />
                    </label>
                    <label>
                    Cuisine :
                    <input type="checkbox" checked={reservationDetails.cuisine === 1} disabled />
                    </label>
                    <label>
                    Balcon :
                    <input type="checkbox" checked={reservationDetails.balcon === 1} disabled />
                    </label>
                    <label>
                    Jardin :
                    <input type="checkbox" checked={reservationDetails.jardin === 1} disabled />
                    </label>
                    <label>
                    Parking :
                    <input type="checkbox" checked={reservationDetails.parking === 1} disabled />
                    </label>
                    <label>
                    Piscine :
                    <input type="checkbox" checked={reservationDetails.piscine === 1} disabled />
                    </label>
                    <label>
                    Jaccuzzi :
                    <input type="checkbox" checked={reservationDetails.jaccuzzi === 1} disabled />
                    </label>
                    <label>
                    Salle de Sport :
                    <input type="checkbox" checked={reservationDetails.salleDeSport === 1} disabled />
                    </label>
                    <label>
                    Climatisation :
                    <input type="checkbox" checked={reservationDetails.climatisation === 1} disabled />
                    </label>
                </div>
                <button className="btn btn-dark" onClick={handleCreateReservation}>Réserver</button>
            </div>
        ) : message && (
            <p className="errorMessage">{message}</p>
        )}

        <hr></hr>
        <h1>Réservations effectuées</h1>

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
                        <h3>Votre réservation : {reservation.nomBien}</h3>
                        <img className="photoDuBien" src={`${BACK_URL}/${reservation.images[0]}`} alt={reservation.nomBien} />
                        <p>ID du Bien Immobilier : {reservation.id_BienImmobilier}</p>
                        <p>ID du Client voyageur : {reservation.id_ClientVoyageur}</p>
                        <h3>Prix par nuit: {reservation.prix}€</h3>
                        <p>Statut : {reservation.statut}</p>
                        <input type="date" name="dateDebut" value={reservation.dateDebut}/>
                        <input type="date" name="dateFin" value={reservation.dateFin} />
                        <p>Total: <strong>{Math.ceil(Math.abs(depart - arrivee) / (1000 * 60 * 60 * 24)) * reservation.prix}€</strong> pour {Math.ceil(Math.abs(depart - arrivee) / (1000 * 60 * 60 * 24))} nuits</p>
                        <div className='equipments'>    
                        <h5>Équipements</h5>
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