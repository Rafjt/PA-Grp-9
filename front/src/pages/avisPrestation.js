import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function AvisPrestation() {
  const { prestationId, prestataireId } = useParams();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    commentaire: Yup.string().required("Le commentaire est requis"),
    note: Yup.number()
      .min(1, "La note doit être entre 1 et 5")
      .max(5, "La note doit être entre 1 et 5")
      .required("La note est requise"),
  });

  return (
    <div className="form-container-presta">
      <h1>Laisser un avis</h1>
      <Formik
        initialValues={{
          commentaire: "",
          note: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          // Handle review submission here
          // You might need to call an API endpoint to save the review
          // await submitReview(prestationId, prestataireId, values);
          setSubmitting(false);
          navigate("/some-page"); // Navigate to a different page after submission
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <label htmlFor="note">Note</label>
            <Field as="select" id="note" name="note" className="form-input">
              <option value="">Sélectionner...</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
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

            <br></br>

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
