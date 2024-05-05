import React, { useState } from "react";
import "./login.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { login } from "../services";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validationSchema = Yup.object().shape({
  adresseMail: Yup.string()
    .matches(emailRegex, "Adresse email invalide")
    .max(70, "L'adresse mail ne peut pas dépasser 70 caractères")
    .required("Ce champ est requis"),
  motDePasse: Yup.string().required("Ce champ est requis"),
});

function Login() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values) => {
    const { adresseMail, motDePasse, type } = values;
    try {
      const response = await login(adresseMail, motDePasse, type);
      if (response.status === 200) {
        console.log("Logged in");
        window.location.replace("/");
      }
    } catch (error) {
      console.error(error);
      if (error.message === "Unauthorized") {
        setErrorMessage("Compte introuvable");
      } else if (error.message === "UserBanned") {
        setErrorMessage("Votre compte est banni");
      } else if (error.message === "WrongPWD"){
        setErrorMessage("Mot de passe erroné");
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        className="login-container rounded p-5 text-white"
        style={{
          backgroundImage: "linear-gradient(#080808, #1F1F1F)",
          boxShadow: "4.0px 8.0px 8.0px hsl(0deg 0% 0% / 0.38)",
        }}
      >
        <h2 className="mb-4">Se connecter</h2>
        <Formik
          initialValues={{ adresseMail: "", motDePasse: "", type: "voyageurs" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            <div className="mb-3">
              <Field
                type="text"
                name="adresseMail"
                placeholder="Adresse email"
                className="input form-control"
                style={{ width: "100%" }}
              />
            {errorMessage && <div className="error">{errorMessage}</div>}
            </div>
            <ErrorMessage name="adresseMail" component="div" className="error" />
            <div className="mb-3">
              <Field
                type={showPassword ? "text" : "password"}
                name="motDePasse"
                placeholder="Mot de passe"
                className="input form-control"
                style={{ width: "100%" }}
              />
              <ErrorMessage name="motDePasse" component="div" className="error" />
            </div>
            <div className="mb-3 form-check" style={{ width: "100%" }}>
              <input
                type="checkbox"
                className="form-check-input"
                id="showPassword"
                onChange={() => setShowPassword(!showPassword)}
              />
              <label className="form-check-label" htmlFor="showPassword" style={{ width: "auto" }}>
                Afficher le mot de passe
              </label>
            </div>
            <div className="mb-3">
              <label htmlFor="type">Type de compte :</label>
              <Field as="select" name="type" className="form-select" style={{ width: "100%" }}>
                <option value="voyageurs">Voyageur</option>
                <option value="clientsBailleurs">Bailleur</option>
                <option value="prestataires">Prestataire</option>
              </Field>
            </div>
            <button
              type="submit"
              className="btn btn-dark btn-lg mt-4"
              style={{
                width: "100%",
                backgroundColor: "#000000",
                color: "#FFFFFF",
              }}
            >
              Se connecter
            </button>
          </Form>
        </Formik>
        <div className="mt-3">
          <p>
            Vous n'avez pas de compte ?{" "}
            <a href="/signup" className="text-white">
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
