import React, { useEffect, useState } from "react";
import { fetchAnnonce, fetchUsers } from "../services";
import "./pageBien.css";
import { BACK_URL } from "../services";

const PageBien = () => {
  const ITEMS_PER_PAGE = 8;

  const [currentPage, setCurrentPage] = useState(1);

  // Function to handle pagination navigation
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const [bailleur, setBailleur] = React.useState([]);
  const [data, setData] = React.useState([]);

  useEffect(() => {
    fetchUsers().then((response) => {
      setBailleur(response.clientsBailleurs);
      console.log(response.clientsBailleurs);
    });

    const defaultFilters = {
      id: "",
      ville: "",
      arrivee: new Date().toISOString().split("T")[0],
      depart: new Date().toISOString().split("T")[0],
      typeDePropriete: "",
      nombreChambres: "",
      nombreLits: "",
      nombreSallesDeBain: "",
      prixMin: "",
      prixMax: "",
      wifi: 0,
      cuisine: 0,
      balcon: 0,
      jardin: 0,
      parking: 0,
      piscine: 0,
      jaccuzzi: 0,
      salleDeSport: 0,
      climatisation: 0,
    };

    fetch(`${BACK_URL}/api/bienDispo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(defaultFilters),
    })
    .then((response) => response.json())
    .then((data) => {
      setData(data);
      setCurrentPage(1);
    });
  }, []);

  // Calculate the total number of pages
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  // Calculate the index of the first and last item to display on the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, data.length);

  const handleClick = (id) => {
    const { arrivee, depart } = filtres;
    window.location.replace(
      `./viewBien/${id}?arrivee=${arrivee}&depart=${depart}`
    );
  };

  const [filtres, setFiltres] = React.useState({
    ville: "",
    arrivee: new Date().toISOString().split("T")[0],
    depart: new Date().toISOString().split("T")[0],
  });

  const handleInputChange = (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
          ? 1
          : 0
        : event.target.value;
    setFiltres({
      ...filtres,
      [event.target.name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(filtres);
    const response = await fetch(`${BACK_URL}/api/bienDispo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filtres),
    });

    const newData = await response.json();
    setData(newData);
  };

  return (
    <div className="mb-5">
      <h1>Page Bien</h1>
      <div className="searchbar-top">
        <select name="ville" value={filtres.ville} onChange={handleInputChange}>
          <option value="">-- Ville --</option>
          <option value="Paris">Paris</option>
          <option value="Nice">Nice</option>
          <option value="Biarritz">Biarritz</option>
        </select>
        <input
          type="date"
          name="arrivee"
          placeholder="arrivée"
          min={new Date().toISOString().split("T")[0]}
          value={filtres.arrivee}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="depart"
          placeholder="départ"
          min={filtres.arrivee}
          value={filtres.depart}
          onChange={handleInputChange}
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="filters">
          <div className="filter-section">
            <label>
              <h5>Type de propriété</h5>
              <select
                name="typeDePropriete"
                id="typeDePropriete"
                value={filtres.typeDePropriete}
                onChange={handleInputChange}
              >
                <option value="">Tout</option>
                <option value="Maison">Maison</option>
                <option value="Appartement">Appartement</option>
                <option value="Maison d'hôtes">Maison d'hôtes</option>
                <option value="Hôtel">Hôtel</option>
              </select>
            </label>
            <br></br>
            <label>
              <h5>Chambres</h5>
              <select
                name="nombreChambres"
                id="nombreChambres"
                value={filtres.nombreChambres}
                onChange={handleInputChange}
              >
                <option value="">Tout</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8+">8+</option>
              </select>
            </label>

            <label>
              <h5>Lits</h5>
              <select
                name="nombreLits"
                id="nombreLits"
                value={filtres.nombreLits}
                onChange={handleInputChange}
              >
                <option value="">Tout</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8+">8+</option>
              </select>
            </label>
            <label>
              <h5>Salles de bain</h5>
              <select
                name="nombreSallesDeBain"
                id="nombreSallesDeBain"
                value={filtres.nombreSallesDeBain}
                onChange={handleInputChange}
              >
                <option value="">Tout</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8+">8+</option>
              </select>
            </label>
            <br></br>
            <label>
              <h5>Prix</h5>
              <input
                type="number"
                name="prixMin"
                value={filtres.prixMin}
                onChange={handleInputChange}
                placeholder="Prix min"
              />
              <input
                type="number"
                name="prixMax"
                value={filtres.prixMax}
                onChange={handleInputChange}
                placeholder="Prix max"
              />
            </label>
          </div>
          <br></br>
          <h4>Équipements</h4>
          <div className="filter-checkboxes">
            <label>
              <input
                type="checkbox"
                name="wifi"
                className="form-check-input"
                value={filtres.wifi}
                onChange={handleInputChange}
              />
              Wifi
            </label>
            <label>
              <input
                type="checkbox"
                name="cuisine"
                className="form-check-input"
                value={filtres.cuisine}
                onChange={handleInputChange}
              />
              Cuisine
            </label>
            <label>
              <input
                type="checkbox"
                name="balcon"
                className="form-check-input"
                value={filtres.balcon}
                onChange={handleInputChange}
              />
              Balcon
            </label>
            <label>
              <input
                type="checkbox"
                name="jardin"
                className="form-check-input"
                value={filtres.jardin}
                onChange={handleInputChange}
              />
              Jardin
            </label>
            <label>
              <input
                type="checkbox"
                name="parking"
                className="form-check-input"
                value={filtres.parking}
                onChange={handleInputChange}
              />
              Parking
            </label>
            <label>
              <input
                type="checkbox"
                name="piscine"
                className="form-check-input"
                value={filtres.piscine}
                onChange={handleInputChange}
              />
              Piscine
            </label>
            <label>
              <input
                type="checkbox"
                name="jaccuzzi"
                className="form-check-input"
                value={filtres.jaccuzzi}
                onChange={handleInputChange}
              />
              Jaccuzzi
            </label>
            <label>
              <input
                type="checkbox"
                name="salleDeSport"
                className="form-check-input"
                value={filtres.salleDeSport}
                onChange={handleInputChange}
              />
              Salle de sport
            </label>
            <label>
              <input
                type="checkbox"
                name="climatisation"
                className="form-check-input"
                value={filtres.climatisation}
                onChange={handleInputChange}
              />
              Climatisation
            </label>
          </div>
        </div>
        <button type="submit">Rechercher</button>
      </form>
      <hr />
      <div>
        <div className="grid-container">
          {/* Display items for the current page */}
          {data.slice(startIndex, endIndex).map((annonce) => {
            const bailleurInfo = bailleur.find(
              (b) => b.id === annonce.bailleurId
            );
            const clientName =
              annonce.prenom && annonce.nom
                ? annonce.prenom + " " + annonce.nom
                : bailleurInfo
                ? bailleurInfo.prenom + " " + bailleurInfo.nom
                : "Unknown";
            return (
              <div key={annonce.id} onClick={() => handleClick(annonce.id)}>
                <img
                  src={`${BACK_URL}/uploads/${annonce.cheminImg}`}
                  alt={annonce.nomBien}
                  className="img"
                />
                <h2>
                  {annonce.ville}, {annonce.nomBien}
                </h2>
                <p className="grey">Proposé par {clientName}</p>
                <p>
                  <strong>{annonce.prix}€</strong> par nuits
                </p>
              </div>
            );
          })}
        </div>

        {/* Pagination controls */}
        <div className="paginationBtn">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button key={index + 1} onClick={() => goToPage(index + 1)}>
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};
export default PageBien;
