import React, { useEffect, useState } from "react";
import { BACK_URL, deleteAnnonce,fetchAnnonceByBailleur } from "../services";
import { Link } from "react-router-dom";
import "./mesBiens.css";

const MesBiens = () => {
  const [annonces, setAnnonces] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchAnnonceByBailleur()
      .then((data) => {
        setAnnonces(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleDelete = async (annonceId) => {
    await deleteAnnonce(annonceId);
    setAnnonces(annonces.filter((annonce) => annonce.id !== annonceId));
  };

  const handleClick = (annonceId) => {
    sessionStorage.setItem("elementId", annonceId);
    window.location.href = "/modifyBien"; // Navigate to the modify page
  };

  const toggleDetails = (id) => {
    setShowDetails((prevShowDetails) => ({
      ...prevShowDetails,
      [id]: !prevShowDetails[id],
    }));
  };

  const tocalendar = () => {
    window.location.href = "/calendarBailleurs";
  };

  return (
    <div>
      <h1>Mes Biens</h1>
      <hr />
      <div className="bienBailleur">
        {annonces.map(
          (annonce) =>
            annonce && (
              <div key={annonce.id} className="annonce">
                <img
                  src={`${BACK_URL}/${annonce.images[0]}`}
                  alt={annonce.nomBien}
                  className="mesBiensImg"
                />
                <h2>
                  {annonce.ville}, {annonce.nomBien}
                </h2>
                <h3>{annonce.adresse}</h3>
                <p className="assets">Prix par nuits: {annonce.prix}€</p>
                <button onClick={() => toggleDetails(annonce.id)}>
                  {showDetails[annonce.id]
                    ? "Masquer les détails"
                    : "Afficher les détails"}
                </button>
                {showDetails[annonce.id] && (
                  <div
                    className="table-container-mesBiens"
                    style={{
                      width: "100%",
                      margin: "0 auto",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <table
                      className="table-mesBiens"
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <tbody>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Ville</strong>
                          </td>
                          <td>{annonce.ville}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Adresse</strong>
                          </td>
                          <td>{annonce.adresse}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Prix</strong>
                          </td>
                          <td>{annonce.prix}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Nom du bien</strong>
                          </td>
                          <td>{annonce.nomBien}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Description</strong>
                          </td>
                          <td>{annonce.description}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Disponible</strong>
                          </td>
                          <td>{annonce.disponible}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Type de propriete</strong>
                          </td>
                          <td>{annonce.typeDePropriete}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Nombre de chambres</strong>
                          </td>
                          <td>{annonce.nombreChambres}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Nombre de lits</strong>
                          </td>
                          <td>{annonce.nombreLits}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Nombre de salles de bain</strong>
                          </td>
                          <td>{annonce.nombreSallesDeBain}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Wifi</strong>
                          </td>
                          <td>{annonce.wifi === 1 ? "Oui" : "Non"}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Cuisine</strong>
                          </td>
                          <td>{annonce.cuisine === 1 ? "Oui" : "Non"}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Balcon</strong>
                          </td>
                          <td>{annonce.balcon === 1 ? "Oui" : "Non"}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Jardin</strong>
                          </td>
                          <td>{annonce.jardin === 1 ? "Oui" : "Non"}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Parking</strong>
                          </td>
                          <td>{annonce.parking === 1 ? "Oui" : "Non"}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Piscine</strong>
                          </td>
                          <td>{annonce.piscine === 1 ? "Oui" : "Non"}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Jaccuzzi</strong>
                          </td>
                          <td>{annonce.jaccuzzi === 1 ? "Oui" : "Non"}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Salle de sport</strong>
                          </td>
                          <td>{annonce.salleDeSport === 1 ? "Oui" : "Non"}</td>
                        </tr>
                        <tr
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          <td>
                            <strong>Climatisation</strong>
                          </td>
                          <td>{annonce.climatisation === 1 ? "Oui" : "Non"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                <button onClick={() => handleDelete(annonce.id)}>Supprimer</button>
                <button onClick={() => handleClick(annonce.id)}>
                  Modifier
                </button>
              </div>
            )
        )}
      </div>
      <hr />
      <div>
        <button className="btn btn-dark" onClick={tocalendar}>
          Calendrier d'occupation de vos biens
        </button>
      </div>
    </div>
  );
};

export default MesBiens;
