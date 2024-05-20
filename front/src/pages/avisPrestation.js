import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { fetchPrestationByPrestationId, uploadAvis } from "../services";

function AvisPrestation() {
  const { prestationId } = useParams();
  const navigate = useNavigate();
  const [prestation, setPrestation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPrestationByPrestationId(prestationId);
        setPrestation(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prestationId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const validationSchema = Yup.object({
    commentaire: Yup.string().required("Le commentaire est requis"),
    note: Yup.number()
      .typeError("La note doit être un nombre")
      .min(1, "La note doit être entre 1 et 5")
      .max(5, "La note doit être entre 1 et 5")
      .required("La note est requise"),
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  console.log(prestation.id_Prestataire);

  return (
    <div className="form-container-presta mt-5">
      <h2>
        Donnez votre avis sur {prestation.prenom} {prestation.nom} au sujet de
        la prestation suivante: {prestation.nomPrestation}
      </h2>
      <button onClick={toggleMenu} className="toggle-button">
        {isMenuOpen ? "Cacher les détails" : "Afficher les détails"}
      </button>
      {isMenuOpen && (
        <div
          className="table-container-mesBiens mb-5"
          style={{
            width: "100%",
            margin: "0 auto",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <table
            className="details-board table table-bordered table-sm shadow rounded border-dark"
            style={{ width: "50%", margin: "0 auto" }}
          >
            <tbody>
              <tr>
                <td>
                  <strong>Description:</strong>
                </td>
                <td>{prestation.description}</td>
              </tr>
              <tr>
                <td>
                  <strong>Type d'intervention:</strong>
                </td>
                <td>{prestation.typeIntervention}</td>
              </tr>
              <tr>
                <td>
                  <strong>Ville:</strong>
                </td>
                <td>{prestation.ville}</td>
              </tr>
              <tr>
                <td>
                  <strong>Adresse:</strong>
                </td>
                <td>{prestation.lieux}</td>
              </tr>
              <tr>
                <td>
                  <strong>Date:</strong>
                </td>
                <td>{prestation.date}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <Formik
        initialValues={{
          commentaire: "",
          note: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            console.log(
              prestationId,
              prestation.id_Prestataire,
              prestation.id_BienImmobilier,
              values.note,
              values.commentaire
            );
            await uploadAvis(
              prestation.id_BienImmobilier,
              prestation.id_Prestataire,
              prestation.typeIntervention,
              values.note,
              values.commentaire,
              prestationId
            );
            navigate("/prestations");
          } catch (error) {
            console.error("Error uploading avis:", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <label htmlFor="note">Note sur 5</label>
            <Field as="select" id="note" name="note" className="form-input">
              <option value="">Sélectionner...</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="note"
              component="div"
              className="error-message"
            />
            <label htmlFor="commentaire">Commentaire</label>
            <Field
              as="textarea"
              id="commentaire"
              name="commentaire"
              className="form-input"
            />
            <ErrorMessage
              name="commentaire"
              component="div"
              className="error-message"
            />

            <br />
            <button
              type="submit"
              className="form-submit"
              disabled={isSubmitting}
            >
              Soumettre
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AvisPrestation;
