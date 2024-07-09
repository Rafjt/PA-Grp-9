import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import './gestionReservations.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';
import {
  fetchReservation,
  deleteReservation,
  createReservation,
  updateReservation,
  fetchAnnonceByBailleurId,
  fetchVoyageurs,
  fetchBailleurs,
  BACK_URL
} from '../services';

const GestionReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [message, setMessage] = useState('');
  const [arrivee, setArrivee] = useState(new Date());
  const [depart, setDepart] = useState(new Date());
  const [annonces, setAnnonces] = useState([]);
  const [voyageurs, setVoyageurs] = useState([]);
  const [bailleurs, setBailleurs] = useState([]);
  const [voyageurId, setVoyageurId] = useState(null);
  const [bienImoId, setBienImoId] = useState(null);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term
  const [filterPast, setFilterPast] = useState(false); // State for past reservations
  const [filterOngoing, setFilterOngoing] = useState(false); // State for ongoing reservations
  const [filterUpcoming, setFilterUpcoming] = useState(false); // State for upcoming reservations

  useEffect(() => {
    fetchReservation()
      .then(data => setReservations(data))
      .catch(error => console.error('Error fetching reservations:', error));
    fetchVoyageurs()
      .then(data => setVoyageurs(data))
      .catch(error => console.error('Error fetching voyageurs:', error));
    fetchBailleurs()
      .then(data => setBailleurs(data))
      .catch(error => console.error('Error fetching bailleurs:', error));
  }, []);

  useEffect(() => {
    if (searchId) {
      fetchAnnonceByBailleurId(searchId)
        .then(data => setAnnonces(data))
        .catch(error => console.error('Error fetching annonces:', error));
    }
  }, [searchId]);

  const handleDelete = (reservationId) => {
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

  const handleCreateReservation = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    if (!bienImoId || !arrivee || !depart || !voyageurId) {
      setMessage("Veuillez compléter tous les champs requis.");
      return;
    }

    const reservationData = {
      id_BienImmobilier: bienImoId, // Assuming BienImoId is the selected bien immobilier's id
      id_Voyageur: voyageurId, // Assuming voyageurId is the selected voyageur's id
      dateDebut: arrivee.toISOString().substring(0, 10), // format YYYY-MM-DD
      dateFin: depart.toISOString().substring(0, 10), // format YYYY-MM-DD
      prixTotal: calculateTotalPrice(annonces.find(a => a.id === bienImoId)?.prix || 0, arrivee, depart)
    };

    try {
      console.log('Création de la réservation avec les données:', reservationData);
      const data = await createReservation(reservationData); // Use createReservation here

      console.log('Réponse de la création de réservation:', data);
      setMessage("Réservation créée avec succès!");

      // Fetch the updated list of reservations
      fetchReservation()
        .then(data => setReservations(data))
        .catch(error => console.error('Error fetching reservations:', error));

      // Optionally reset the form fields after successful creation
      setArrivee(new Date());
      setDepart(new Date());
      setVoyageurId(null);
      setBienImoId(null);
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      setMessage("Échec de la création de la réservation.");
    }
  };

  const handleEditReservation = (reservation) => {
    setEditingReservationId(reservation.id);
    setArrivee(new Date(reservation.dateDebut));
    setDepart(new Date(reservation.dateFin));
  };

  const handleSaveReservation = async (reservation) => {
    const updatedReservation = {
      id: reservation.id, // Include the reservation ID for the update
      dateDebut: arrivee.toISOString().substring(0, 10), // format YYYY-MM-DD
      dateFin: depart.toISOString().substring(0, 10), // format YYYY-MM-DD
    };

    try {
      await updateReservation(updatedReservation);
      setReservations((prevReservations) => prevReservations.map((res) =>
        res.id === reservation.id ? { ...res, ...updatedReservation } : res
      ));
      setEditingReservationId(null);
      setMessage("Réservation mise à jour avec succès!");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réservation:", error);
      setMessage("Échec de la mise à jour de la réservation.");
    }
  };

  const calculateTotalPrice = (price, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return price * diffDays;
  };

  // Filter reservations based on search term and checkboxes
  const filteredReservations = reservations.filter(reservation => {
    const reservationDateDebut = new Date(reservation.dateDebut);
    const reservationDateFin = new Date(reservation.dateFin);
    const now = new Date();
    const matchesSearchTerm = reservation.nomBien.toLowerCase().includes(searchTerm.toLowerCase()) || reservation.ville.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterPast && reservationDateFin < now) {
      return matchesSearchTerm;
    }
    if (filterOngoing && reservationDateDebut <= now && reservationDateFin >= now) {
      return matchesSearchTerm;
    }
    if (filterUpcoming && reservationDateDebut > now) {
      return matchesSearchTerm;
    }
    if (!filterPast && !filterOngoing && !filterUpcoming) {
      return matchesSearchTerm;
    }
    return false;
  });

  return (
    <div className="gestionReservations container">
      <div className="greet text-center my-5">
        <h1>Gestion des Réservations</h1>
        <button
          onClick={() => (window.location.href = "/backOffice")}
          className="btn btn-primary my-3"
        >
          Retour
        </button>
        <h2>Ici, vous pouvez consulter, créer, mettre à jour ou annuler des réservations</h2>
      </div>

      <form className="reservationCreate mb-5" onSubmit={handleCreateReservation}>
        <h2>Créer une réservation</h2>
        <select className='reservationCreate mb-5' onChange={handleSearch}>
          <option value="">Sélectionnez un bailleur</option>
          {bailleurs.map((bailleur) => (
            <option key={bailleur.id} value={bailleur.id}>{bailleur.nom} {bailleur.prenom}</option>
          ))}
        </select>
        <select className='reservationCreate mb-5' disabled={!searchId} onChange={(e) => setBienImoId(e.target.value)}>
          <option value="">Sélectionnez une annonce</option>
          {annonces.map((annonce) => (
            <option key={annonce.id} value={annonce.id}>{annonce.nomBien}, {annonce.ville}</option>
          ))}
        </select>
        <select className='reservationCreate mb-5' onChange={(e) => setVoyageurId(e.target.value)}>
          <option value="">Sélectionnez un voyageur</option>
          {voyageurs.map((voyageur) => (
            <option key={voyageur.id} value={voyageur.id}>{voyageur.nom} {voyageur.prenom}</option>
          ))}
        </select>
        <div className="d-flex justify-content-between">
          <DatePicker
            selected={arrivee}
            onChange={date => setArrivee(date)}
            selectsStart
            startDate={arrivee}
            endDate={depart}
            minDate={new Date()}
          />
          {arrivee && (
            <DatePicker
              selected={depart}
              onChange={date => setDepart(date)}
              selectsEnd
              startDate={arrivee}
              endDate={depart}
              minDate={arrivee ? arrivee : new Date()}
            />
          )}
        </div>
        <button type="submit" className="btn btn-success mt-3">Créer</button>
      </form>

      <hr />
      <h1 className="my-5">Réservations effectuées</h1>

      <div className="search-bar mb-3">
        <input
          type="text"
          placeholder="Rechercher par nom de bien ou ville"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="filter-options mb-5">
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="checkbox"
            id="filterPast"
            checked={filterPast}
            onChange={(e) => setFilterPast(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="filterPast">Réservations passées</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="checkbox"
            id="filterOngoing"
            checked={filterOngoing}
            onChange={(e) => setFilterOngoing(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="filterOngoing">Réservations en cours</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="checkbox"
            id="filterUpcoming"
            checked={filterUpcoming}
            onChange={(e) => setFilterUpcoming(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="filterUpcoming">Réservations à venir</label>
        </div>
      </div>

      <div className="row">
        {filteredReservations.map((reservation) => (
          <div key={reservation.id} className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h3>Bien réservé : {reservation.nomBien}</h3>
              </div>
              <div className="card-body">
                {reservation.images.length > 0 && (
                  <img className="photoDuBien img-fluid mb-3" src={`${BACK_URL}/${reservation.images[0]}`} alt={reservation.nomBien} />
                )}
                <p>ID du Bien Immobilier : {reservation.id_BienImmobilier}</p>
                <h3>Prix par nuit: {reservation.prix}€</h3>
                {editingReservationId === reservation.id ? (
                  <div>
                    <DatePicker
                      selected={arrivee}
                      onChange={date => setArrivee(date)}
                      selectsStart
                      startDate={arrivee}
                      endDate={depart}
                      minDate={new Date()}
                    />
                    {arrivee && (
                      <DatePicker
                        selected={depart}
                        onChange={date => setDepart(date)}
                        selectsEnd
                        startDate={arrivee}
                        endDate={depart}
                        minDate={arrivee ? arrivee : new Date()}
                      />
                    )}
                    <button
                      className="btn btn-success mt-3"
                      onClick={() => handleSaveReservation(reservation)}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div>
                    <input type="date" name="dateDebut" value={reservation.dateDebut} readOnly className="form-control mb-2" />
                    <input type="date" name="dateFin" value={reservation.dateFin} readOnly className="form-control mb-2" />
                    <p>Total: <strong>{calculateTotalPrice(reservation.prix, reservation.dateDebut, reservation.dateFin)}€</strong> pour {Math.ceil(Math.abs(new Date(reservation.dateFin) - new Date(reservation.dateDebut)) / (1000 * 60 * 60 * 24))} nuits</p>
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => handleEditReservation(reservation)}
                    >
                      Edit
                    </button>
                  </div>
                )}
                <div className="equipments">
                  <h5>Équipements:</h5>
                  <ul>
                    {['wifi', 'cuisine', 'balcon', 'jardin', 'parking', 'piscine', 'jaccuzzi', 'salleDeSport', 'climatisation'].map((item) => (
                      <li key={item}>{item.charAt(0).toUpperCase() + item.slice(1)} : {reservation[item] === 1 ? '✔️' : '❌'}</li>
                    ))}
                  </ul>
                </div>
                <button className="btn btn-danger mt-3" onClick={() => handleDelete(reservation.id)}>Annuler la réservation</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionReservations;
