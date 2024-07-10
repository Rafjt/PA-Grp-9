import "./gestionUtilisateur.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FadeLoader } from "react-spinners";
import {
  fetchGeneralInfoByPrestataire,
  fetchEvaluationsByPrestataire,
  getCredentials,
  validatePrestataire,
} from "../services";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PerfPresta = () => {
  const [loading, setLoading] = useState(true);
  const [generalInfo, setGeneralInfo] = useState({});
  const [evaluations, setEvaluations] = useState([]);
  const [isValid, setIsValid] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCredentials();
        const prestataireId = userData.id;
        validatePrestataire().then((data) => {
          setIsValid(data.valide === 1);
        });

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
          {t("compteNonValide")}
        </h1>
        <h2 style={{ fontSize: "1.2em", margin: "0" }}>
          {t("attendreValidation")}
        </h2>
        <img
          src="/Lock.png"
          alt="warning"
          style={{ width: "100px", margin: "20px 0" }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="loader-overlay" style={{ display: loading ? "block" : "none" }}>
        <FadeLoader color="#2f3636" size={50} />
      </div>
      <div className="container mt-5">
        <h1 className="mb-4">{t('performancesTitle')}</h1>
        <button onClick={() => (window.location.href = "/espacePrestataire")} className="back-button">
          {t('back')}
        </button>
        {evaluations.length === 0 ? (
          <div className="no-evaluations">
            <h2>{t('noEvaluations')}</h2>
            <button onClick={() => (window.location.href = "/espacePrestataire")} className="back-button">
              {t('back')}
            </button>
            <p>{t('startWorking')} <a href="/MePlacer">{t('here')}</a>.</p>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-4">
              <div className="rounded p-3 shadow mb-4">
                <h3>{t('information')}</h3>
                <ul className="list-unstyled">
                  <li><strong>{t('fullName')}: </strong> {generalInfo.prestaPrenom} {generalInfo.prestaNom}</li>
                  <li><strong>{t('email')}: </strong> {generalInfo.adresseMail}</li>
                  <li><strong>{t('dob')}: </strong> {formatDate(generalInfo.dateDeNaissance)}</li>
                </ul>
              </div>
              <div className="rounded p-3 shadow">
                <h3>{t('completedServices')}</h3>
                <ul className="list-unstyled">
                  <li><strong>{t('numberOfServices')}: </strong>{generalInfo.nombrePresta}</li>
                  <li><strong>{t('averageRating')}: </strong> {getTrimmedNoteMoy()}⭐</li>
                </ul>
              </div>
            </div>
            <div className="col-md-8">
              <div className="rounded p-3 shadow" style={{ minHeight: "500px", overflowX: "auto" }}>
                <h3>{t('evaluations')}</h3>
                <div className="table-responsive rounded shadow">
                  <table className="table table-bordered table-hover custom-table">
                    <thead>
                      <tr className="sticky-header">
                        <th>{t('requester')}</th>
                        <th>{t('name')}</th>
                        <th>{t('interventionType')}</th>
                        <th className="narrow-column">{t('city2')}</th>
                        <th className="narrow-column">{t('rating')}</th>
                        <th className="long-column">{t('comment')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluations.map((evaluation, index) => (
                        <tr key={index}>
                          <td>{evaluation.demandeurPrenom} {evaluation.demandeurNom}</td>
                          <td>{evaluation.nom}</td>
                          <td>{evaluation.typeIntervention}</td>
                          <td>{evaluation.ville}</td>
                          <td>{evaluation.note}⭐</td>
                          <td className="long-column">{evaluation.commentaire}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
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
        .no-evaluations {
          text-align: center;
          margin-top: 50px;
        }
        .no-evaluations h2 {
          font-size: 24px;
          margin-bottom: 20px;
        }
        .no-evaluations a {
          color: #007bff;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

export default PerfPresta;
