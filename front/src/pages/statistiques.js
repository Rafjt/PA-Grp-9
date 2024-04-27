import "./gestionUtilisateur.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { HashLoader } from 'react-spinners';
import { fetchNombreUsers, fetchAgeMoyenUsers } from "../services";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";

const Statistiques = () => {
  //PARTIE UTILISATEUR
  const [loading, setLoading] = useState(true);
  const [voyageursCount, setVoyageursCount] = useState(0);
  const [clientsBailleursCount, setClientsBailleursCount] = useState(0);
  const [prestatairesCount, setPrestatairesCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [meanAge, setMeanAge] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const voyageursData = await fetchNombreUsers('voyageurs');
        setVoyageursCount(voyageursData.count);

        const clientsBailleursData = await fetchNombreUsers('clientsBailleurs');
        setClientsBailleursCount(clientsBailleursData.count);

        const prestatairesData = await fetchNombreUsers('prestataires');
        setPrestatairesCount(prestatairesData.count);

        const ageMoyenData = await fetchAgeMoyenUsers();
        setMeanAge(ageMoyenData.mean_age);
      } catch (error) {
        console.error('Error fetching user data:', error);
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

  //PARTIE ANNONCES/BIENS

  return (
    <body>
      <div className="container mt-5">
        <h1 className="mb-4">Statistiques et Rapports du Site</h1>
        <div className="row">
          <div className="col-md-6">
            {loading && (
              <div className="loader-overlay">
                <HashLoader color="#36D7B7" size={50} />
              </div>
            )}
            {!loading && (
              <>
                <h3>Utilisateurs</h3>
                <ul className="list-unstyled">
                  <li>Nombre de voyageurs: {voyageursCount}</li>
                  <li>Nombre de clients bailleurs: {clientsBailleursCount}</li>
                  <li>Nombre de prestataires: {prestatairesCount}</li>
                  <li>Nombre total d'utilisateurs: {totalUsersCount}</li>
                  <li>Age moyen des utilisateurs: {getTrimmedMeanAge()}</li>
                </ul>
              </>
            )}
          </div>
          <div className="col-md-6">
            <h3>Annonces</h3>
            <ul className="list-unstyled">
              <li>Nombre d'annonces: {}</li>
              <li>Prix moyen des annonces</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
  );
};

export default Statistiques;
