import React, { useEffect, useState } from "react";
import {
  fetchReservationByIdVoyageur,
  getCredentials,
  BACK_URL,
} from "../services";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./mesReservations.css";

const MesReservations = () => {
  const { t } = useTranslation();
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
                console.log(data);
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

  function goToDiscussion() {
    window.location.replace("/espaceDiscussion");
  }

  return (
    <div className="reservationBoard">
      <h1 className="mt-1">{t("myReservations")}</h1>
      <button
        onClick={() => (window.location.href = "/espaceVoyageur")}
        className="back-button"
      >
        {t("back")}
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
              <p>{t("pricePerNight")}: {reservation.prix}€</p>
              {/* Button to toggle showing details for the current reservation */}
              <button
                onClick={() => toggleDetails(index)}
                className="boutondetail"
              >
                {showDetails[index]
                  ? t("hideDetails")
                  : t("showDetails")}
              </button>
              {/* Reservation details */}
              {showDetails[index] && (
                <div className="reservation-details d-flex justify-content-between" style={{ maxWidth: "1000px", margin: "0 auto" }}>
                  {/* Div for general information */}
                  <div
                    className="p-3 rounded shadow"
                    style={{ border: "2px solid #ccc" }}
                  >
                    <h5 className="mb-3">{t("generalInfo")}</h5>
                    <p>
                      <strong>{t("startDate")}:</strong>{" "}
                      {formatDate(reservation.dateDebut)}
                    </p>
                    <p>
                      <strong>{t("endDate")}:</strong>{" "}
                      {formatDate(reservation.dateFin)}
                    </p>
                    <p>
                      <strong>{t("propertyType")}:</strong>{" "}
                      {reservation.typeDePropriete}
                    </p>
                    <p>
                      <strong>{t("numberOfRooms")}:</strong>{" "}
                      {reservation.nombreChambres}
                    </p>
                    <p>
                      <strong>{t("numberOfBeds")}:</strong> {reservation.nombreLits}
                    </p>
                    <p>
                      <strong>{t("numberOfBathrooms")}:</strong>{" "}
                      {reservation.nombreSallesDeBain}
                    </p>
                  </div>

                  {/* Div for bailleur information */}
                  <div
                    className="p-3 rounded shadow"
                    style={{ border: "2px solid #ccc" }}
                  >
                    <h5 className="mb-3">{t("landlordInfo")}</h5>
                    <p>
                      <strong>{t("landlordName")}:</strong>{" "}
                      {reservation.bailleurPrenom} {reservation.bailleurNom}
                    </p>
                    <p>
                      <strong>{t("landlordEmail")}:</strong>{" "}
                      {reservation.bailleurMail}
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary mr-2 mt-3"
                      onClick={goToDiscussion}
                    >
                      {t("chatWithLandlord")}
                    </button>
                  </div>

                  {/* Div for options */}
                  <div
                    className="p-3 rounded shadow"
                    style={{ border: "2px solid #ccc" }}
                  >
                    <h5 className="mb-3">{t("options")}</h5>
                    <p>
                      <strong>{t("wifi")}:</strong>{" "}
                      {reservation.wifi === 1 ? t("yes") : t("no")}
                    </p>
                    <p>
                      <strong>{t("kitchen")}:</strong>{" "}
                      {reservation.cuisine === 1 ? t("yes") : t("no")}
                    </p>
                    <p>
                      <strong>{t("balcony")}:</strong>{" "}
                      {reservation.balcon === 1 ? t("yes") : t("no")}
                    </p>
                    <p>
                      <strong>{t("garden")}:</strong>{" "}
                      {reservation.jardin === 1 ? t("yes") : t("no")}
                    </p>
                    <p>
                      <strong>{t("parking")}:</strong>{" "}
                      {reservation.parking === 1 ? t("yes") : t("no")}
                    </p>
                    <p>
                      <strong>{t("pool")}:</strong>{" "}
                      {reservation.piscine === 1 ? t("yes") : t("no")}
                    </p>
                    <p>
                      <strong>{t("jacuzzi")}:</strong>{" "}
                      {reservation.jaccuzzi === 1 ? t("yes") : t("no")}
                    </p>
                    <p>
                      <strong>{t("gym")}:</strong>{" "}
                      {reservation.salleDeSport === 1 ? t("yes") : t("no")}
                    </p>
                    <p>
                      <strong>{t("airConditioning")}:</strong>{" "}
                      {reservation.climatisation === 1 ? t("yes") : t("no")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>{t("noReservationsFound")}</p>
        )}
      </div>
    </div>
  );
};

export default MesReservations;
