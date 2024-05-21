import "./gestionUtilisateur.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FadeLoader } from "react-spinners";
import {
  fetchGeneralInfoByPrestataire,
  fetchEvaluationsByPrestataire,
  getCredentials,
} from "../services";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PerfPresta = () => {
  const [loading, setLoading] = useState(true);
  const [generalInfo, setGeneralInfo] = useState({});
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCredentials();
        const prestataireId = userData.id;

        const generalInfoData = await fetchGeneralInfoByPrestataire(
          prestataireId
        );
        const evaluationsData = await fetchEvaluationsByPrestataire(
          prestataireId
        );

        setGeneralInfo(generalInfoData);
        setEvaluations(evaluationsData);
        console.log("Fetched general information:", generalInfoData);
        console.log("Fetched evaluations:", evaluationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTrimmedNoteMoy = () => {
    if (generalInfo.noteMoy) {
      const notMoyString = generalInfo.noteMoy.toString();
      const trimmedNotMoy = parseFloat(notMoyString).toFixed(1); // Trim the mean age to one decimal place
      return trimmedNotMoy;
    }
    return 0;
  };

  function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <>
      <div
        className="loader-overlay"
        style={{ display: loading ? "block" : "none" }}
      >
        <FadeLoader color="#2f3636" size={50} />
      </div>
      <div className="container mt-5">
        <h1 className="mb-4">Performances et avis sur les prestations</h1>
        <Link to="/espacePrestataire" className="back-button">
          Retour
        </Link>
        <div className="row">
          <div className="col-md-4">
            <div className="rounded p-3 shadow mb-4">
              <h3>Informations</h3>
              <ul className="list-unstyled">
                <li>
                  <strong>Nom complet: </strong> {generalInfo.prestaPrenom}{" "}
                  {generalInfo.prestaNom}
                </li>
                <li>
                  <strong>Adresse Email: </strong> {generalInfo.adresseMail}
                </li>
                <li>
                  <strong>Date de naissance: </strong>{" "}
                  {formatDate(generalInfo.dateDeNaissance)}{" "}
                </li>
              </ul>
            </div>
            <div className="rounded p-3 shadow">
              <h3>Prestations réalisées</h3>
              <ul className="list-unstyled">
                <li>
                  <strong>Nombre de prestations: </strong>
                  {generalInfo.nombrePresta}
                </li>
                <li>
                  <strong>Note moyenne: </strong> {getTrimmedNoteMoy()}⭐
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-8">
            <div
              className="rounded p-3 shadow"
              style={{ minHeight: "500px", overflowX: "auto" }}
            >
              <h3>Évaluations</h3>
              <div className="table-responsive rounded shadow">
                <table className="table table-bordered table-hover custom-table">
                  <thead>
                    <tr className="sticky-header">
                      <th>Demandeur</th>
                      <th>Nom</th>
                      <th>Type d'intervention</th>
                      <th className="narrow-column">Ville</th>
                      <th className="narrow-column">Note</th>
                      <th className="long-column">Commentaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((evaluation, index) => (
                      <tr key={index}>
                        <td>
                          {evaluation.demandeurPrenom} {evaluation.demandeurNom}
                        </td>
                        <td>{evaluation.nom}</td>
                        <td>{evaluation.typeIntervention}</td>
                        <td>{evaluation.ville}</td>
                        <td>{evaluation.note}⭐</td>
                        <td className="long-column">
                          {evaluation.commentaire}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-table td {
          white-space: normal !important;
        }
        .back-button {
          position: absolute;
          top: 120px;
          left: 30px;
          background-color: #007bff;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
          transition: background-color 0.3s ease;
        }
        .back-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </>
  );
};

export default PerfPresta;
