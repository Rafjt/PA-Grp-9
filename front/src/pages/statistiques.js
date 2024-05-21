import "./gestionUtilisateur.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FadeLoader } from "react-spinners";
import {
  fetchNombreUsers,
  fetchAgeMoyenUsers,
  fetchNombreAnnonces,
  fetchPrixAnnonce,
} from "../servicesStats";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import PieChart from "../components/pieChart";

const Statistiques = () => {
  //PARTIE UTILISATEUR
  const [loading, setLoading] = useState(true);
  const [voyageursCount, setVoyageursCount] = useState(0);
  const [clientsBailleursCount, setClientsBailleursCount] = useState(0);
  const [prestatairesCount, setPrestatairesCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [meanAge, setMeanAge] = useState(0);
  const [annonceCount, setAnnonceCount] = useState(0);
  const [prixAnnonce, setPrixAnnonce] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const voyageursData = await fetchNombreUsers("voyageurs");
        setVoyageursCount(voyageursData.count);

        const clientsBailleursData = await fetchNombreUsers("clientsBailleurs");
        setClientsBailleursCount(clientsBailleursData.count);

        const prestatairesData = await fetchNombreUsers("prestataires");
        setPrestatairesCount(prestatairesData.count);

        const ageMoyenData = await fetchAgeMoyenUsers();
        setMeanAge(ageMoyenData.mean_age);

        const annonceCount = await fetchNombreAnnonces();
        setAnnonceCount(annonceCount);

        const prixAnnonce = await fetchPrixAnnonce();
        setPrixAnnonce(prixAnnonce);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const totalUsers =
      voyageursCount + clientsBailleursCount + prestatairesCount;
    setTotalUsersCount(totalUsers);
  }, [voyageursCount, clientsBailleursCount, prestatairesCount]);

  const getTrimmedMeanAge = () => {
    if (meanAge) {
      const meanAgeString = meanAge.toString();
      const trimmedAge = parseFloat(meanAgeString).toFixed(1); // Trim the mean age to one decimal place
      return trimmedAge;
    }
    return 0;
  };

  const formattedPrix = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(prixAnnonce.prixMoy);

  //PARTIE ANNONCES/BIENS
  return (
    <>
      <div
        className="loader-overlay"
        style={{ display: loading ? "block" : "none" }}
      >
        <FadeLoader color="#2f3636" size={50} />
      </div>
      <div className="container mt-5">
        <h1 className="mb-4">Statistiques et Rapports du Site</h1>
        <button
          onClick={() => (window.location.href = "/backOffice")}
          className="back-button"
        >
          Retour
        </button>
        <div className="row">
          {/* Left column (1/3 of the screen) */}
          <div className="col-md-4">
            {/* Utilisateurs */}
            <div className="rounded p-3 shadow mb-4">
              <h3>Utilisateurs</h3>
              <ul className="list-unstyled">
                <li>Nombre de voyageurs: {voyageursCount}</li>
                <li>Nombre de clients bailleurs: {clientsBailleursCount}</li>
                <li>Nombre de prestataires: {prestatairesCount}</li>
                <li>Nombre total d'utilisateurs: {totalUsersCount}</li>
                <li>Age moyen des utilisateurs: {getTrimmedMeanAge()}</li>
              </ul>
            </div>
            {/* Annonces */}
            <div className="rounded p-3 shadow">
              <h3>Annonces</h3>
              <ul className="list-unstyled">
                <li>Nombre d'annonces: {annonceCount}</li>
                <li>Prix moyen des annonces: {formattedPrix}</li>
              </ul>
            </div>
          </div>
          {/* Right column (2/3 of the screen) */}
          <div className="col-md-8">
            {/* Empty div for the chart */}
            <div className="rounded p-3 shadow" style={{ minHeight: "500px" }}>
              <PieChart
                counts={[
                  voyageursCount,
                  clientsBailleursCount,
                  prestatairesCount,
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistiques;
