import React, { useEffect, useState } from "react";
import { fetchUsers, fetchBienDispo, BACK_URL } from "../services";
import { useTranslation } from "react-i18next";
import "./pageBien.css";

const PageBien = () => {
  const { t } = useTranslation();
  const ITEMS_PER_PAGE = 8;

  const [currentPage, setCurrentPage] = useState(1);
  const [bailleur, setBailleur] = useState([]);
  const [data, setData] = useState([]);
  const [filtres, setFiltres] = useState({
    ville: "",
    arrivee: new Date().toISOString().split("T")[0],
    depart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    fetchUsers().then((response) => {
      setBailleur(response.clientsBailleurs);
      console.log(response.clientsBailleurs);
    });

    const defaultFilters = {
      id: "",
      ville: "",
      arrivee: new Date().toISOString().split("T")[0],
      depart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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

    fetchBienDispo(defaultFilters).then((data) => {
      setData(data);
      console.log(data);
      setCurrentPage(1);
    });
  }, []);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, data.length);

  const handleClick = (id) => {
    const { arrivee, depart } = filtres;
    window.location.replace(
      `./viewBien/${id}?arrivee=${arrivee}&depart=${depart}`
    );
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    let newValue = type === "checkbox" ? (checked ? 1 : 0) : value;

    // Automatically set the departure date to the next day when the arrival date is changed
    if (name === "arrivee") {
      const arriveeDate = new Date(newValue);
      const nextDay = new Date(arriveeDate.getTime() + 24 * 60 * 60 * 1000);
      const formattedNextDay = nextDay.toISOString().split("T")[0];
      setFiltres({
        ...filtres,
        arrivee: newValue,
        depart: formattedNextDay,
      });
    } else {
      setFiltres({
        ...filtres,
        [name]: newValue,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Convert the dates to Date objects for comparison
    const arriveeDate = new Date(filtres.arrivee);
    const departDate = new Date(filtres.depart);

    // Check if the depart date is earlier than the arrivee date
    if (departDate < arriveeDate) {
      setShowAlert(true);
      return;
    }

    console.log(filtres);
    const newData = await fetchBienDispo(filtres);
    setData(newData);
  };

  console.log(bailleur);

  return (
    <div className="mb-5">
      <h1 className="mt-5">{t("pageTitle")}</h1>
      <button onClick={() => window.history.back()} className="back-button">
        {t("back")}
      </button>
      <div className="searchbar-top">
        <select name="ville" value={filtres.ville} onChange={handleInputChange}>
          <option value="">{t("city")}</option>
          <option value="Paris">Paris</option>
          <option value="Nice">Nice</option>
          <option value="Biarritz">Biarritz</option>
        </select>
        <input
          type="date"
          name="arrivee"
          min={new Date().toISOString().split("T")[0]}
          value={filtres.arrivee}
          onChange={handleInputChange}
          onKeyPress={(e) => e.preventDefault()}
        />
        <input
          type="date"
          name="depart"
          min={new Date(new Date(filtres.arrivee).getTime() + 1000 * 60 * 60 * 24).toISOString().split("T")[0]}
          value={filtres.depart}
          onChange={handleInputChange}
          onKeyPress={(e) => e.preventDefault()}
        />
      </div>
      {showAlert && (
        <div className="alert alert-danger" role="alert">
          La date de départ doit être postérieure à la date d'arrivée.
          <button type="button" className="close" onClick={() => setShowAlert(false)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="filters">
          <div className="filter-section">
            <label>
              <h5>{t("propertyType")}</h5>
              <select
                name="typeDePropriete"
                value={filtres.typeDePropriete}
                onChange={handleInputChange}
              >
                <option value="">{t("all")}</option>
                <option value="Maison">{t("house")}</option>
                <option value="Appartement">{t("apartment")}</option>
                <option value="Maison d'hôtes">{t("guestHouse")}</option>
                <option value="Hôtel">{t("hotel")}</option>
              </select>
            </label>
            <label>
              <h5>{t("rooms")}</h5>
              <select
                name="nombreChambres"
                value={filtres.nombreChambres}
                onChange={handleInputChange}
              >
                <option value="">{t("all")}</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
                <option value="8+">{t("eightPlus")}</option>
              </select>
            </label>
            <label>
              <h5>{t("beds")}</h5>
              <select
                name="nombreLits"
                value={filtres.nombreLits}
                onChange={handleInputChange}
              >
                <option value="">{t("all")}</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
                <option value="8+">{t("eightPlus")}</option>
              </select>
            </label>
            <label>
              <h5>{t("bathrooms")}</h5>
              <select
                name="nombreSallesDeBain"
                value={filtres.nombreSallesDeBain}
                onChange={handleInputChange}
              >
                <option value="">{t("all")}</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
                <option value="8+">{t("eightPlus")}</option>
              </select>
            </label>
            <label>
              <h5>{t("price")}</h5>
              <input
                type="number"
                name="prixMin"
                value={filtres.prixMin}
                onChange={handleInputChange}
                placeholder={t("minPrice")}
              />
              <input
                type="number"
                name="prixMax"
                value={filtres.prixMax}
                onChange={handleInputChange}
                placeholder={t("maxPrice")}
              />
            </label>
          </div>
          <h4>{t("amenities")}</h4>
          <div className="filter-checkboxes">
            {["wifi", "cuisine", "balcon", "jardin", "parking", "piscine", "jaccuzzi", "salleDeSport", "climatisation"].map((amenity) => (
              <label key={amenity}>
                <input
                  type="checkbox"
                  name={amenity}
                  className="form-check-input"
                  checked={filtres[amenity] === 1}
                  onChange={handleInputChange}
                />
                {t(amenity)}
              </label>
            ))}
          </div>
        </div>
        <button type="submit">{t("search")}</button>
      </form>
      <hr />
      <div>
        <div className="grid-container">
          {data.slice(startIndex, endIndex).map((annonce) => {
            const clientName =
              annonce.bailleurPrenom && annonce.bailleurNom
                ? `${annonce.bailleurPrenom} ${annonce.bailleurNom}`
                : "Unknown";

            return (
              <div key={annonce.id} onClick={() => handleClick(annonce.id)}>
                <img
                  src={`${BACK_URL}/${annonce.images[0]}`}
                  alt={annonce.nomBien}
                  className="img"
                />
                <h2>
                  {annonce.ville}, {annonce.nomBien}
                </h2>
                <p className="grey">{t("offeredBy", { clientName })}</p>
                <p>
                  <strong>{annonce.prix}€</strong> {t("perNight")}
                </p>
              </div>
            );
          })}
        </div>
        <div className="paginationBtn">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            {t("previous")}
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button key={index + 1} onClick={() => goToPage(index + 1)}>
              {index + 1}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            {t("next")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageBien;
