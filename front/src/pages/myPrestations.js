import React, { useEffect, useState } from "react";
import { validatePrestataire, fetchPrestationsById } from "../services";
import "./myPrestations.css";

function MyPrestations() {
  const [isValid, setIsValid] = useState(null);
  const [prestations, setPrestations] = useState([]);

  useEffect(() => {
    validatePrestataire().then((data) => {
      setIsValid(data.valide === 1);
    });
  }, []);

  useEffect(() => {
    fetchPrestationsById().then((data) => {
      setPrestations(data);
    });
  }, []);

  if (isValid === null) {
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #f5c6cb",
          marginBottom: "25%",
          marginTop: "25%",
        }}
      >
        <h1 style={{ fontSize: "1.5em", margin: "0" }}>
          Votre compte n'est pas encore validé.
        </h1>
        <h2 style={{ fontSize: "1.2em", margin: "0" }}>
          Veuillez attendre que l'administrateur valide votre compte.
        </h2>
        <img
          src="/Lock.png"
          alt="warning"
          style={{ width: "100px", margin: "20px 0" }}
        />
      </div>
    );
  }

  const acceptedPrestations = prestations.filter(
    (prestation) => prestation.statut === "ACCEPTEE"
  );
  const finishedPrestations = prestations.filter(
    (prestation) => prestation.statut === "TERMINEE"
  );

  const handleContact = (clientId, clientName, userType) => {
    const client = { id: clientId, name: clientName, type: userType };
    localStorage.setItem("selectedClient", JSON.stringify(client));
    window.location.replace("/espaceDiscussion");
  };

  return (
    <div>
      <h1 className="mt-5">Mes Prestations</h1>
      <button
        onClick={() => (window.location.href = "/espacePrestataire")}
        className="back-button"
      >
        Retour
      </button>
      <hr />
      <h2>Acceptées</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Date</th>
            <th>Lieux</th>
            <th>Ville</th>
            <th>Type d'intervention</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {acceptedPrestations.map((prestation, index) => (
            <tr key={index}>
              <td>{prestation.nom}</td>
              <td>{prestation.description}</td>
              <td>{prestation.date}</td>
              <td>{prestation.lieux}</td>
              <td>{prestation.ville}</td>
              <td>{prestation.typeIntervention}</td>
              <td
                onClick={() =>
                  handleContact(
                    prestation.id_Voyageur || prestation.id_ClientBailleur,
                    prestation.clientName,
                    prestation.id_Voyageur ? "Voyageur" : "ClientBailleur"
                  )
                }
              >
                Contacter le client
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Terminées</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Date</th>
            <th>Lieux</th>
            <th>Ville</th>
            <th>Type d'intervention</th>
          </tr>
        </thead>
        <tbody>
          {finishedPrestations.map((prestation, index) => (
            <tr key={index} className="finished-row">
              <td>{prestation.nom}</td>
              <td>{prestation.description}</td>
              <td>{prestation.date}</td>
              <td>{prestation.lieux}</td>
              <td>{prestation.ville}</td>
              <td>{prestation.typeIntervention}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyPrestations;
