import React, { useEffect, useState } from "react";
import "./prestations.css";
import {
  getCredentials,
  fetchPrestationsById,
  createPrestation,
  fetchAnnonceByBailleur,
  deletePrestation,
  fetchUserById,
  archiverPresta,
} from "../services";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Prompt from "../components/prompt.js";
import { useTranslation } from "react-i18next";

function Prestations() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prestations, setPrestations] = useState([]);
  const [biens, setBiens] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedPrestationId, setSelectedPrestationId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  const yyyy = today.getFullYear();

  const todayFormatted = yyyy + "-" + mm + "-" + dd;

  const handleDelete = (id, action) => {
    setSelectedPrestationId(id);
    setActionType(action);
    setShowPrompt(true);
  };

  const confirmDelete = async () => {
    if (actionType === "delete") {
      await deletePrestation(selectedPrestationId);
    } else if (actionType === "archive") {
      await archiverPresta(selectedPrestationId);
    }
    setShowPrompt(false);
    fetchData(); // Call fetchData to refresh the data
  };

  const cancelDelete = () => {
    setShowPrompt(false);
    setSelectedPrestationId(null);
    setActionType(null);
  };

  const handleContact = () => {
    window.location.replace("/espaceDiscussion");
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  console.log(user);
  const fetchData = async () => {
    const userData = await getCredentials();
    setUser(userData);
    setLoading(false);

    if (userData.type === "prestataires") {
      navigate("/login");
    }

    const prestationsData = await fetchPrestationsById();
    setPrestations(prestationsData);

    const biensData = await fetchAnnonceByBailleur();
    setBiens(biensData);

    const fetchedPrestataires = await Promise.all(
      prestationsData.map(async (prestation) => {
        if (prestation.id_Prestataire) {
          const prestataire = await fetchUserById(
            prestation.id_Prestataire,
            "prestataires"
          );
          return { ...prestation, prestataire };
        } else {
          return prestation;
        }
      })
    );
    setPrestataires(fetchedPrestataires);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validationSchema = Yup.object({
    typeIntervention: Yup.string().required(t("requiredType")),
    nom: Yup.string().required(t("requiredName")),
    date: Yup.date()
      .min(todayFormatted, t("dateAfterToday"))
      .required(t("requiredDate")),
    ville: Yup.string().required(t("requiredCity")),
    lieux: Yup.string().required(t("requiredPlace")),
    description: Yup.string().required(t("requiredDescription")),
    id_BienImmobilier: Yup.string().when("user", {
      is: (user) => user && user.type === "clientsBailleurs",
      then: Yup.string().required(t("requiredProperty")),
    }),
  });
  const handleRedirect = (userType) => {
    switch (userType) {
      case "clientBailleurs":
        window.location.href = "/espaceBailleur";
        break;
      case "voyageurs":
        window.location.href = "/espaceVoyageur";
        break;
      default:
        // Handle any other user types or redirect to a default location
        window.location.href = "/";
    }
  };

  return (
    <div>
      <h1 className="mt-5">{t("prestationsDemandees")}</h1>
      <button onClick={() => handleRedirect(user.type)} className="back-button">
        {t("back")}
      </button>
      <hr />
      <div>
        <table className="prestaTable table-responsive shadow">
          <thead>
            <tr>
              <th>Type</th>
              <th>{t("name")}</th>
              <th>Description</th>
              <th>{t("status")}</th>
              <th>{t("price")}</th>
              <th>Date</th>
              <th>{t("location")}</th>
              {user && user.type === "clientsBailleurs" && (
                <th>{t("associatedProperty")}</th>
              )}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {prestataires.map((prestation) => (
              <tr key={prestation.id}>
                <td>{prestation.typeIntervention}</td>
                <td>{prestation.nom}</td>
                <td>{prestation.description}</td>
                <td>
                  {prestation.statut === "ACCEPTEE"
                    ? `${prestation.statut} par ${prestation.prestataire.prenom} ${prestation.prestataire.nom}`
                    : prestation.statut}
                </td>
                <td>{prestation.prix}</td>
                <td>
                  {new Date(prestation.date) < new Date() ? (
                    <span style={{ color: "red" }}>{t("dateDepassee")}</span>
                  ) : (
                    formatDate(prestation.date)
                  )}
                </td>
                <td>
                  {prestation.ville}, {prestation.lieux}
                </td>
                {user && user.type === "clientsBailleurs" && (
                  <td>{prestation.nomBien}</td>
                )}
                <td>
                  {prestation.id && prestation.id_Prestataire ? (
                    <>
                      {new Date(prestation.date) >= new Date() &&
                      prestation.statut === "ACCEPTEE" ? (
                        <button
                          className="contact-button"
                          onClick={handleContact}
                        >
                          Contacter le prestataire
                        </button>
                      ) : new Date(prestation.date) < new Date() ? (
                        <>
                          {prestation.evalExists !== 0 && (
                            <button
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                handleDelete(prestation.id, "archive")
                              }
                            >
                              {t("archive")}
                            </button>
                          )}
                          {prestation.evalExists ? (
                            <Link
                              to={`/viewAvis/${prestation.id}/${prestation.id_Prestataire}`}
                              style={{
                                cursor: "pointer",
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              <button>{t("viewReview")}</button>
                            </Link>
                          ) : (
                            <Link
                              to={`/avisPrestation/${prestation.id}/${prestation.id_Prestataire}`}
                              style={{
                                cursor: "pointer",
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              <button className="btn-avis">
                                {t("leaveReview")}
                              </button>
                            </Link>
                          )}
                        </>
                      ) : (
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(prestation.id, "delete")}
                        >
                          {t("cancel")}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(prestation.id, "delete")}
                    >
                      {t("delete")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />
      <div className="form-container-presta">
        <div className="formPresta">
          <h1>{t("requestService")}</h1>
          <Formik
            initialValues={{
              typeIntervention: "",
              nom: "",
              date: "",
              ville: "",
              lieux: "",
              description: "",
              id_BienImmobilier:
                user && user.type === "clientsBailleurs" ? "" : undefined,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              await createPrestation(values);
              fetchData(); // Call fetchData to refresh the data
              resetForm(); // Reset the form fields
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <label htmlFor="typeIntervention">{t("serviceType")}</label>
                <Field
                  as="select"
                  id="typeIntervention"
                  name="typeIntervention"
                  className="form-input"
                >
                  <option value="">{t("select")}</option>
                  <option value="Conciergerie">{t("conciergerie")}</option>
                  <option value="Entretien ménager">
                    {t("entretienMenager")}
                  </option>
                  <option value="Maintenance">{t("maintenance")}</option>
                  <option value="Jardinage et entretien extérieur">
                    {t("jardinage")}
                  </option>
                  <option value="Livraison">{t("livraison")}</option>
                  <option value="Gestion des déchets">
                    {t("gestionDechets")}
                  </option>
                  <option value="Soutien administratif">
                    {t("soutienAdministratif")}
                  </option>
                  <option value="Déménagement">{t("demenagement")}</option>
                  <option value="Chauffeur">{t("chauffeur")}</option>
                  <option value="Sécurité">{t("securite")}</option>
                </Field>
                <ErrorMessage
                  name="typeIntervention"
                  component="div"
                  className="error-message"
                />

                <label htmlFor="nom">{t("requestTitle")}</label>
                <Field type="text" id="nom" name="nom" className="form-input" />
                <ErrorMessage
                  name="nom"
                  component="div"
                  className="error-message"
                />

                <label htmlFor="date">Date</label>
                <Field
                  type="date"
                  id="date"
                  name="date"
                  className="form-input"
                  min={todayFormatted}
                />
                <ErrorMessage
                  name="date"
                  component="div"
                  className="error-message"
                />

                <label htmlFor="ville">{t("city")}</label>
                <Field
                  as="select"
                  id="ville"
                  name="ville"
                  className="form-input"
                >
                  <option value="">{t("select")}</option>
                  <option value="Paris">Paris</option>
                  <option value="Nice">Nice</option>
                  <option value="Biarritz">Biarritz</option>
                </Field>
                <ErrorMessage
                  name="ville"
                  component="div"
                  className="error-message"
                />

                <label htmlFor="lieux">{t("location")}</label>
                <Field
                  type="text"
                  id="lieux"
                  name="lieux"
                  className="form-input"
                />
                <ErrorMessage
                  name="lieux"
                  component="div"
                  className="error-message"
                />

                {user && user.type === "clientsBailleurs" && (
                  <>
                    <label htmlFor="id_BienImmobilier">
                      {t("associatedProperty")}
                    </label>
                    <Field
                      as="select"
                      id="id_BienImmobilier"
                      name="id_BienImmobilier"
                      className="form-input"
                    >
                      <option value="">{t("select")}</option>
                      {biens.map((bien) => (
                        <option key={bien.id} value={bien.id}>
                          {bien.nomBien}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="id_BienImmobilier"
                      component="div"
                      className="error-message"
                    />
                  </>
                )}

                <label htmlFor="description">Description</label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  className="form-input"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="error-message"
                />

                <br />
                <br />
                <button
                  type="submit"
                  className="form-submit"
                  disabled={isSubmitting}
                >
                  {t("submit")}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {showPrompt && (
        <Prompt
          message={
            actionType === "delete" ? t("confirmDelete") : t("confirmArchive")
          }
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default Prestations;
