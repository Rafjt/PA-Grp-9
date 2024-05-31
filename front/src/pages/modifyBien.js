import React, { useEffect, useState } from "react";
import { updateAnnonce, fetchAnnonceById, BACK_URL } from "../services";
import { useNavigate } from "react-router-dom";
import "./modifyBien.css";

const ModifyBien = () => {
  const [annonce, setAnnonce] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const id = sessionStorage.getItem("elementId");
    fetchAnnonceById(id)
      .then((data) => {
        setAnnonce(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleChange = (event) => {
    setAnnonce({ ...annonce, [event.target.name]: event.target.value });
  };

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await updateAnnonce(annonce.id, annonce, selectedFiles);
    navigate("/mesBiens");
  };

  return (
    <div>
      <h1>Modifier le bien</h1>
      <hr />
      <form onSubmit={handleSubmit}>
        {annonce && (
          <div className="containerViewBien">
            <h1>
              <input
                type="text"
                name="nomBien"
                value={annonce.nomBien}
                onChange={handleChange}
              />
            </h1>
            <div className="gallery-container-Modify">
              {selectedFiles.length > 0
                ? selectedFiles.map((file, index) => (
                    <img
                      key={index}
                      className="gallery-item-Modify"
                      src={URL.createObjectURL(file)}
                      alt={annonce.nomBien}
                      style={{ maxHeight: "500px" }}
                    />
                  ))
                : annonce.images.map((image, index) => (
                    <img
                      key={index}
                      className={`gallery-item-Modify item-${index + 1}-Modify rounded`}
                      src={`${BACK_URL}/${image}`}
                      alt={`${annonce.nomBien}-${index}`}
                      style={{ maxHeight: "500px" }}
                    />
                  ))}
            </div>
            <input type="file" onChange={handleFileChange} multiple />
            <h2>
              <input
                type="text"
                name="typeDePropriete"
                value={annonce.typeDePropriete}
                onChange={handleChange}
              />
            </h2>
            <h3>
              <input
                type="text"
                name="ville"
                value={annonce.ville}
                onChange={handleChange}
              />
            </h3>
            <h3>
              <input
                type="text"
                name="adresse"
                value={annonce.adresse}
                onChange={handleChange}
              />
            </h3>
            <p>
              <input
                type="number"
                name="nombreChambres"
                value={annonce.nombreChambres}
                onChange={handleChange}
              />{" "}
              Chambres
            </p>
            <p>
              <input
                type="number"
                name="nombreLits"
                value={annonce.nombreLits}
                onChange={handleChange}
              />{" "}
              Lits
            </p>
            <p>
              <input
                type="number"
                name="nombreSallesDeBain"
                value={annonce.nombreSallesDeBain}
                onChange={handleChange}
              />{" "}
              Salles de bain
            </p>
            <hr />
            <p>
              <strong>
                <input
                  type="number"
                  name="prix"
                  value={annonce.prix}
                  onChange={handleChange}
                />
                €
              </strong>{" "}
              par nuits
            </p>
            <p>
              <textarea
                name="description"
                value={annonce.description}
                onChange={handleChange}
              />
            </p>
            <hr />
            <p>Equipements:</p>
            <table className="equipment-table">
              <tbody>
                <tr>
                  <th>wifi</th>
                  <td>
                    <input
                      type="checkbox"
                      checked={annonce.wifi === 1}
                      onChange={() =>
                        setAnnonce({
                          ...annonce,
                          wifi: annonce.wifi === 1 ? 0 : 1,
                        })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th>Cuisine</th>
                  <td>
                    <input
                      type="checkbox"
                      checked={annonce.cuisine === 1}
                      onChange={() =>
                        setAnnonce({
                          ...annonce,
                          cuisine: annonce.cuisine === 1 ? 0 : 1,
                        })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th>Balcon</th>
                  <td>
                    <input
                      type="checkbox"
                      checked={annonce.balcon === 1}
                      onChange={() =>
                        setAnnonce({
                          ...annonce,
                          balcon: annonce.balcon === 1 ? 0 : 1,
                        })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th>Jardin</th>
                  <td>
                    <input
                      type="checkbox"
                      checked={annonce.jardin === 1}
                      onChange={() =>
                        setAnnonce({
                          ...annonce,
                          jardin: annonce.jardin === 1 ? 0 : 1,
                        })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th>Parking</th>
                  <td>
                    <input
                      type="checkbox"
                      checked={annonce.parking === 1}
                      onChange={() =>
                        setAnnonce({
                          ...annonce,
                          parking: annonce.parking === 1 ? 0 : 1,
                        })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th>Piscine</th>
                  <td>
                    <input
                      type="checkbox"
                      checked={annonce.piscine === 1}
                      onChange={() =>
                        setAnnonce({
                          ...annonce,
                          piscine: annonce.piscine === 1 ? 0 : 1,
                        })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th>Jaccuzzi</th>
                  <td>
                    <input
                      type="checkbox"
                      checked={annonce.jaccuzzi === 1}
                      onChange={() =>
                        setAnnonce({
                          ...annonce,
                          jaccuzzi: annonce.jaccuzzi === 1 ? 0 : 1,
                        })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th>Salle de sport</th>
                  <td>
                    <input
                      type="checkbox"
                      checked={annonce.salleDeSport === 1}
                      onChange={() =>
                        setAnnonce({
                          ...annonce,
                          salleDeSport: annonce.salleDeSport === 1 ? 0 : 1,
                        })
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <th>Climatisation</th>
                  <td>
                    <input
                      type="checkbox"
                      checked={annonce.climatisation === 1}
                      onChange={() =>
                        setAnnonce({
                          ...annonce,
                          climatisation: annonce.climatisation === 1 ? 0 : 1,
                        })
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <hr />
            <button type="submit" className="btn btn-dark">
              Valider les modifications
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ModifyBien;
