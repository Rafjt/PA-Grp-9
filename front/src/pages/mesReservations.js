import React, { useEffect, useState } from "react";
import {
  fetchReservationByIdVoyageur,
  getCredentials,
  BACK_URL,
} from "../services";
import { Link } from "react-router-dom";
import "./mesReservations.css";

const MesReservations = () => {
  const [reservations, setReservations] = useState([]); // Initialize with an empty array
  const [showDetails, setShowDetails] = useState([]); // State to control showing details for each reservation

  useEffect(() => {
    getCredentials()
      .then((userData) => {
        if (userData) {
          const voyageurId = userData.id;

          fetchReservationByIdVoyageur(voyageurId)
            .then((data) => {
              if (Array.isArray(data)) {
                setReservations(data); // Set reservations array
                // Initialize showDetails state array with false for each reservation
                setShowDetails(Array(data.length).fill(false));
              } else {
                console.error("Data is not an array:", data);
              }
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

  // Function to toggle showing details for a specific reservation
  const toggleDetails = (index) => {
    setShowDetails((prevDetails) => {
      const updatedDetails = [...prevDetails];
      updatedDetails[index] = !updatedDetails[index]; // Toggle details for the clicked reservation
      return updatedDetails;
    });
  };

  function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function goToDiscussion(){
    window.location.replace("/espaceDiscussion");
  }

  return (
    <div className="reservationBoard">
      <h1 className="mt-1">Mes Réservations</h1>
      <button
        onClick={() => (window.location.href = "/espaceVoyageur")}
        className="back-button"
      >
        Retour
      </button>
      <hr />
      <div className="mesResa rounded p-3 shadow">
        {reservations.length > 0 ? (
          reservations.map((reservation, index) => (
            <div key={reservation.id} className="reservation-item">
              {reservation.images && (
                <img
                  src={`${BACK_URL}/${reservation.images[0]}`}
                  alt={reservation.nomBien}
                  className="reservation-image-small"
                />
              )}
              <h2>
                {reservation.ville} {reservation.nomBien}
              </h2>
              <h3>{reservation.adresse}</h3>
              <p>Prix par nuit: {reservation.prix}€</p>
              {/* Button to toggle showing details for the current reservation */}
              <button
                onClick={() => toggleDetails(index)}
                className="boutondetail"
              >
                {showDetails[index]
                  ? "Masquer les détails"
                  : "Afficher les détails"}
              </button>
              {/* Reservation details */}
              {showDetails[index] && (
                <div className="reservation-details d-flex justify-content-between" style={{ maxWidth: "1000px", margin: "0 auto" }}>
                  {/* Div for general information */}
                  <div
                    className="p-3 rounded shadow"
                    style={{ border: "2px solid #ccc" }}
                  >
                    <h5 className="mb-3">Informations générales</h5>
                    <p>
                      <strong>Date de début:</strong>{" "}
                      {formatDate(reservation.dateDebut)}
                    </p>
                    <p>
                      <strong>Date de fin:</strong>{" "}
                      {formatDate(reservation.dateFin)}
                    </p>
                    <p>
                      <strong>Type de propriété:</strong>{" "}
                      {reservation.typeDePropriete}
                    </p>
                    <p>
                      <strong>Nombre de chambres:</strong>{" "}
                      {reservation.nombreChambres}
                    </p>
                    <p>
                      <strong>Nombre de lits:</strong> {reservation.nombreLits}
                    </p>
                    <p>
                      <strong>Nombre de salles de bain:</strong>{" "}
                      {reservation.nombreSallesDeBain}
                    </p>
                  </div>

                  {/* Div for bailleur information */}
                  <div
                    className="p-3 rounded shadow"
                    style={{ border: "2px solid #ccc" }}
                  >
                    <h5 className="mb-3">Informations du bailleur</h5>
                    <p>
                      <strong>Nom du bailleur:</strong>{" "}
                      {reservation.bailleurPrenom} {reservation.bailleurNom}
                    </p>
                    <p>
                      <strong>Adresse mail du bailleur:</strong>{" "}
                      {reservation.bailleurMail}
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary mr-2 mt-3"
                      onClick={goToDiscussion}
                    >
                      Discuter avec le bailleur
                    </button>
                  </div>

                  {/* Div for options */}
                  <div
                    className="p-3 rounded shadow"
                    style={{ border: "2px solid #ccc" }}
                  >
                    <h5 className="mb-3">Options</h5>
                    <p>
                      <strong>Wifi:</strong>{" "}
                      {reservation.wifi === 1 ? "Oui" : "Non"}
                    </p>
                    <p>
                      <strong>Cuisine:</strong>{" "}
                      {reservation.cuisine === 1 ? "Oui" : "Non"}
                    </p>
                    <p>
                      <strong>Balcon:</strong>{" "}
                      {reservation.balcon === 1 ? "Oui" : "Non"}
                    </p>
                    <p>
                      <strong>Jardin:</strong>{" "}
                      {reservation.jardin === 1 ? "Oui" : "Non"}
                    </p>
                    <p>
                      <strong>Parking:</strong>{" "}
                      {reservation.parking === 1 ? "Oui" : "Non"}
                    </p>
                    <p>
                      <strong>Piscine:</strong>{" "}
                      {reservation.piscine === 1 ? "Oui" : "Non"}
                    </p>
                    <p>
                      <strong>Jaccuzzi:</strong>{" "}
                      {reservation.jaccuzzi === 1 ? "Oui" : "Non"}
                    </p>
                    <p>
                      <strong>Salle de sport:</strong>{" "}
                      {reservation.salleDeSport === 1 ? "Oui" : "Non"}
                    </p>
                    <p>
                      <strong>Climatisation:</strong>{" "}
                      {reservation.climatisation === 1 ? "Oui" : "Non"}
                    </p>
                  </div>
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
