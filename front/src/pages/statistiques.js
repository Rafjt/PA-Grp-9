import "./gestionUtilisateur.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { fetchAgeMoyenUsers, fetchNombreUsers } from "../services";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";

const Statistiques = () => {
  const [voyageursCount, setVoyageursCount] = useState(0);
  const [clientsBailleursCount, setClientsBailleursCount] = useState(0);
  const [prestatairesCount, setPrestatairesCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
//   const [ageMoyenUsers, setAgeMoyenUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const voyageursData = await fetchNombreUsers("voyageurs");
        setVoyageursCount(voyageursData.count);

        const clientsBailleursData = await fetchNombreUsers("clientsBailleurs");
        setClientsBailleursCount(clientsBailleursData.count);

        const prestatairesData = await fetchNombreUsers("prestataires");
        setPrestatairesCount(prestatairesData.count);
      } catch (error) {
        console.error("Error fetching user counts:", error);
      }
    };

    fetchData();
  }, []); // Fetch data on component mount

  useEffect(() => {
    // Calculate total users count whenever any of the individual counts change
    const totalUsers =
      voyageursCount + clientsBailleursCount + prestatairesCount;
    setTotalUsersCount(totalUsers);
  }, [voyageursCount, clientsBailleursCount, prestatairesCount]);

//   useEffect(() => {
//     const fetchAge = async () => {
//       try {
//         const ageMoyen = await fetchAgeMoyenUsers(); // Use fetchMeanAge function
//         setAgeMoyenUsers(ageMoyen);
//       } catch (error) {
//         console.error("Error fetching user counts:", error);
//       }
//     };

//     fetchAge();
//   }, []); // Fetch data on component mount

  return (
    <body>
      <div className="container mt-5">
        <h1 className="mb-4">Statistiques et Rapports du Site</h1>
        <div className="row">
          <div className="col-md-6">
            <h3>Utilisateurs</h3>
            <ul className="list-unstyled">
              <li>Nombre de voyageurs: {voyageursCount}</li>
              <li>Nombre de clients bailleurs: {clientsBailleursCount}</li>
              <li>Nombre de prestataires: {prestatairesCount}</li>
              <li>Nombre total d'utilisateurs: {totalUsersCount}</li>
              {/* <li>Age moyen des utilisateurs: {ageMoyenUsers}</li> */}
            </ul>
          </div>
          <div className="col-md-6">
            <h3>Annonces</h3>
            <ul className="list-unstyled">
              <li>Nombre d'annonces</li>
              <li>Prix moyen des annonces</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
  );
};

export default Statistiques;
