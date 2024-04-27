import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { verifConfCode } from "../services";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MailConfirm = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleCode(code) {
    try {
      var button = document.getElementById("submitBtn");
      button.disabled = true;
      const data = await verifConfCode(code);
      console.log(data);
      if (Object.keys(data).length === 0) {
        setSuccessMessage("Vous avez bien été inscrits");
        // Delay the redirection by 3 seconds
        setTimeout(() => {
          // Redirect to login page using window.location
          window.location.href = "/login";
        }, 3000); // 3 seconds
      }
    } catch (error) {
      if (error.message === "TableTempIntrouvable") {
        setErrorMessage("Le code est erroné ou expiré");
      } else {
        console.error(error);
      }
    } finally {
      button.disabled = false;
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <div className="card p-4 rounded shadow">
        <h5 className="mb-4">Un email vous a été envoyé</h5>
        <Formik
          initialValues={{ code: "" }}
          validationSchema={Yup.object({
            code: Yup.string()
              .matches(/^\d{6}$/, "Le code doit être composé de 6 chiffres")
              .required("Le code est requis"),
          })}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            handleCode(values.code);
            setSubmitting(false); // Mark submitting as false after form submission
            resetForm(); // Reset the form fields
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <p>
                Veuillez entrer le code de confirmation contenu dans ce dernier
                :
              </p>
              <Field
                type="text"
                name="code"
                className="form-control mb-3"
                placeholder="Code de confirmation"
              />
              <ErrorMessage
                name="code"
                component="div"
                className="text-danger"
              />
              {errorMessage && (
                <div className="text-danger">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="text-success">{successMessage}</div>
              )}
              <button
                id="submitBtn"
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Vérification en cours..." : "Confirmer"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default MailConfirm;
