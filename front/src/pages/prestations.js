import React, { useEffect, useState } from "react";
import "./prestations.css";
import {
  getCredentials,
  fetchPrestationsById,
  createPrestation,
  fetchAnnonceByBailleur,
  deletePrestation,
  fetchUserById,
} from "../services";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function Prestations() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prestations, setPrestations] = useState([]);
  const [biens, setBiens] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const navigate = useNavigate();

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();

  const todayFormatted = yyyy + "-" + mm + "-" + dd;

  const handleDelete = async (id) => {
    await deletePrestation(id);
    window.location.reload();
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

  useEffect(() => {
    getCredentials().then((data) => {
      setUser(data);
      setLoading(false);

      if (data.type === "prestataires") {
        navigate("/login");
      }
    });

    fetchPrestationsById().then((data) => {
      console.log(data);
      setPrestations(data);
    });

    fetchAnnonceByBailleur().then((data) => {
      setBiens(data);
    });
  }, []);

  useEffect(() => {
    const fetchPrestataires = async () => {
      const fetchedPrestataires = await Promise.all(
        prestations.map(async (prestation) => {
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
    fetchPrestataires();
  }, [prestations]);

  const validationSchema = Yup.object({
    typeIntervention: Yup.string().required(
      "Le type de service demandé est requis"
    ),
    nom: Yup.string().required("L'intitulé de la demande est requis"),
    date: Yup.date()
      .min(
        todayFormatted,
        "La date doit être postérieure ou égale à aujourd'hui"
      )
      .required("La date est requise"),
    ville: Yup.string().required("La ville est requise"),
    lieux: Yup.string().required("Le lieu est requis"),
    description: Yup.string().required("La description est requise"),
    id_BienImmobilier: Yup.string().when("user", {
      is: (user) => user && user.type === "clientsBailleurs",
      then: Yup.string().required("Le bien associé est requis"),
    }),
  });

  return (
    <div>
      <div>
        <table className="prestaTable">
          <thead>
            <tr>
              <th>Type</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Prix</th>
              <th>Date</th>
              <th>Lieu</th>
              {user && user.type === "clientsBailleurs" && (
                <th>Bien associé</th>
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
                  {prestation.statut === "ACCEPTÉE"
                    ? `${prestation.statut} par ${prestation.prestataire.prenom} ${prestation.prestataire.nom}`
                    : prestation.statut}
                </td>
                <td>{prestation.prix}</td>
                <td>
                  {new Date(prestation.date) < new Date() ? (
                    <span style={{ color: "red" }}>Date limite passée</span>
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
                      prestation.statut === "ACCEPTÉE" ? (
                        <span
                          style={{ cursor: "pointer", color: "green" }}
                          onClick={handleContact}
                        >
                          Contacter le prestataire
                        </span>
                      ) : new Date(prestation.date) < new Date() ? (
                        <>
                          <span
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={() => handleDelete(prestation.id)}
                          >
                            X
                          </span>
                          {prestation.evalExists ? (
                            <Link
                              to={`/viewAvis/${prestation.id}/${prestation.id_Prestataire}`}
                              style={{
                                cursor: "pointer",
                                color: "blue",
                                marginLeft: "10px",
                              }}
                            >
                              Visualiser l'avis
                            </Link>
                          ) : (
                            <Link
                              to={`/avisPrestation/${prestation.id}/${prestation.id_Prestataire}`}
                              style={{
                                cursor: "pointer",
                                color: "blue",
                                marginLeft: "10px",
                              }}
                            >
                              Laisser un avis
                            </Link>
                          )}
                        </>
                      ) : (
                        <span
                          style={{ cursor: "pointer", color: "blue" }}
                          onClick={() => handleDelete(prestation.id)}
                        >
                          Annuler
                        </span>
                      )}
                    </>
                  ) : (
                    <span
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={() => handleDelete(prestation.id)}
                    >
                      X
                    </span>
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
          <h1>Demander un service</h1>
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
            onSubmit={async (values, { setSubmitting }) => {
              await createPrestation(values);
              window.location.reload();
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <label htmlFor="typeIntervention">
                  Type de service demandé
                </label>
                <Field
                  as="select"
                  id="typeIntervention"
                  name="typeIntervention"
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Conciergerie">Conciergerie</option>
                  <option value="Entretien ménager">Entretien ménager</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Jardinage et entretien extérieur">
                    Jardinage et entretien extérieur
                  </option>
                  <option value="Livraison">Livraison</option>
                  <option value="Gestion des déchets">
                    Gestion des déchets
                  </option>
                  <option value="Soutien administratif">
                    Soutien administratif
                  </option>
                  <option value="Déménagement">Déménagement</option>
                  <option value="Chauffeur">Chauffeur</option>
                  <option value="Sécurité">Sécurité</option>
                </Field>
                <ErrorMessage
                  name="typeIntervention"
                  component="div"
                  className="error-message"
                />

                <label htmlFor="nom">Intitulé de la demande</label>
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

                <label htmlFor="ville">Ville</label>
                <Field
                  as="select"
                  id="ville"
                  name="ville"
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Paris">Paris</option>
                  <option value="Nice">Nice</option>
                  <option value="Biarritz">Biarritz</option>
                </Field>
                <ErrorMessage
                  name="ville"
                  component="div"
                  className="error-message"
                />

                <label htmlFor="lieux">Lieu</label>
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
                    <label htmlFor="id_BienImmobilier">Bien associé</label>
                    <Field
                      as="select"
                      id="id_BienImmobilier"
                      name="id_BienImmobilier"
                      className="form-input"
                    >
                      <option value="">Sélectionner...</option>
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
                  Submit
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default Prestations;
