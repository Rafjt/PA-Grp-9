import React, { useEffect, useState } from "react";
import { fetchReservationByIdVoyageur, getCredentials, BACK_URL } from "../services";
import { Link } from "react-router-dom";
import "./mesReservations.css";

const MesReservations = () => {
  const [reservations, setReservations] = useState([]); // Initialize with an empty array
  const [showDetails, setShowDetails] = useState(false); // State to control showing details

  useEffect(() => {
    getCredentials()
      .then((userData) => {
        if (userData) {
          const voyageurId = userData.id;

          fetchReservationByIdVoyageur(voyageurId)
            .then((data) => {
              if (Array.isArray(data)) {
                setReservations(data); // Set reservations array
              } else {
                console.error("Data is not an array:", data);
              }
              console.log(data);
            })
            .catch((error) => {
              console.error("Error fetching reservations:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  // Function to toggle showing details
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <div className="reservationBoard">
      <h1 className="mt-1">Mes Réservations</h1>
      <hr />
      <div className="mesResa rounded p-3 shadow">
        {reservations.length > 0 ? (
          reservations.map((reservation) => (
            <div key={reservation.id} className="reservation-item">
              {reservation.cheminImg && (
                <img src={`${BACK_URL}/uploads/${reservation.cheminImg}`} alt={reservation.nomBien} className="reservation-image-small" />
              )}
              <h2>{reservation.ville} {reservation.nomBien}</h2>
              <h3>{reservation.adresse}</h3>
              <p>Prix par nuit: {reservation.prix}€</p>
              {/* Button to toggle showing details */}
              <button onClick={toggleDetails} className="boutondetail">
                {showDetails ? 'Masquer les détails' : 'Afficher les détails'}
              </button>
              {/* Reservation details */}
              {showDetails && (
                <div className="reservation-details">
                  <p><strong>Date de début:</strong>{formatDate(reservation.dateDebut)}</p>
                  <p><strong>Date de fin:</strong> {formatDate(reservation.dateFin)}</p>
                  <p><strong>Type de propriété:</strong> {reservation.typeDePropriete}</p>
                  <p><strong>Nombre de chambres:</strong> {reservation.nombreChambres}</p>
                  <p><strong>Nombre de lits:</strong> {reservation.nombreLits}</p>
                  <p><strong>Nombre de salles de bain:</strong> {reservation.nombreSallesDeBain}</p>
                  <p><strong>Wifi:</strong> {reservation.wifi === 1 ? 'Oui' : 'Non'}</p>
                  <p><strong>Cuisine:</strong> {reservation.cuisine === 1 ? 'Oui' : 'Non'}</p>
                  <p><strong>Balcon:</strong> {reservation.balcon === 1 ? 'Oui' : 'Non'}</p>
                  <p><strong>Jardin:</strong> {reservation.jardin === 1 ? 'Oui' : 'Non'}</p>
                  <p><strong>Parking:</strong> {reservation.parking === 1 ? 'Oui' : 'Non'}</p>
                  <p><strong>Piscine:</strong> {reservation.piscine === 1 ? 'Oui' : 'Non'}</p>
                  <p><strong>Jaccuzzi:</strong> {reservation.jaccuzzi === 1 ? 'Oui' : 'Non'}</p>
                  <p><strong>Salle de sport:</strong> {reservation.salleDeSport === 1 ? 'Oui' : 'Non'}</p>
                  <p><strong>Climatisation:</strong> {reservation.climatisation === 1 ? 'Oui' : 'Non'}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Aucune réservation trouvée.</p>
        )}
      </div>
    </div>
  );
};

export default MesReservations;
