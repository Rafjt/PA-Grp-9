import "bootstrap/dist/css/bootstrap.min.css";
import "./signup.css";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup"; // Import Yup for validation
import { createUser } from "../services";
import { FadeLoader } from "react-spinners";
import { useTranslation } from "react-i18next";

const Signup = () => {
  const nomRegex =
    /^[a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ '-]*$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const now = new Date();
  const minDate = new Date(now);
  minDate.setFullYear(minDate.getFullYear() - 100);
  minDate.setDate(now.getDate() + 1);

  const maxDate = new Date(now);
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  maxDate.setDate(now.getDate());

  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      nom: "",
      prenom: "",
      dateDeNaissance: "",
      adresseMail: "",
      motDePasse: "",
      motDePasseConfirm: "",
      admin: "0",
      type: "voyageurs",
    },
    validationSchema: Yup.object({
      nom: Yup.string()
        .matches(nomRegex, t('nomValidation'))
        .required(t('requiredField'))
        .min(1, t('nomMin'))
        .max(30, t('nomMax')),
      prenom: Yup.string()
        .matches(nomRegex, t('prenomValidation'))
        .required(t('requiredField'))
        .min(1, t('prenomMin'))
        .max(30, t('prenomMax')),
      dateDeNaissance: Yup.date()
        .required(t('requiredField'))
        .min(minDate, t('dateMin'))
        .max(maxDate, t('dateMax')),
      adresseMail: Yup.string()
        .matches(emailRegex, t('emailValidation'))
        .email(t('invalidEmail'))
        .required(t('requiredField'))
        .max(50, t('emailMax')),
      motDePasse: Yup.string()
        .required(t('requiredField'))
        .min(8, t('passwordMin'))
        .max(50, t('passwordMax')),
      motDePasseConfirm: Yup.string()
        .oneOf([Yup.ref("motDePasse"), null], t('passwordMatch'))
        .required(t('requiredField')),
    }),
    onSubmit: (values) => {
      var button = document.getElementById("boutonload");
      button.disabled = true;
      setLoading(true);
      const trimmedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => {
          return [key, typeof value === "string" ? value.trim() : value];
        })
      );
  
      createUser(trimmedValues)
        .then((data) => {
          console.log(data);
          console.log(trimmedValues);
          window.location.replace("/mailConfirm");
        })
        .catch((error) => {
          if (error === "EmailDuplicate") {
            formik.setErrors({
              adresseMail: t('emailDuplicate'),
            });
          } else if (error === "UserBanned") {
            formik.setErrors({
              adresseMail: t('emailBanned'),
            });
          } else {
            console.error("Error creating user:", error);
          }
        })
        .finally(() => {
          button.disabled = false;
          setLoading(false); // Set loading to false after the request completes
        });
    },
  });

  function showPassword() {
    var x = document.getElementById("mdp");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  function showPasswordConfirm() {
    var x = document.getElementById("mdp2");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  return (
    <div className="container-fluid mt-5 mr-0 ml-0 w-100">
      <div className="row">
        <div className="col">
          <div className="margin mt-2 fs-2 mb-2">
            <h5>
              <b>{t("formulaireInscription")}</b>
            </h5>
          </div>
        </div>
      </div>
      <form onSubmit={formik.handleSubmit}>
        <input
          className="input"
          type="text"
          placeholder={t("Nom")}
          name="nom"
          value={formik.values.nom}
          onChange={formik.handleChange}
        />
        {formik.touched.nom && formik.errors.nom ? (
          <div className="error">{formik.errors.nom}</div>
        ) : null}
        <input
          className="input"
          type="text"
          placeholder={t("Prénom")}
          name="prenom"
          value={formik.values.prenom}
          onChange={formik.handleChange}
        />
        {formik.touched.prenom && formik.errors.prenom ? (
          <div className="error">{formik.errors.prenom}</div>
        ) : null}
        <input
          className="input"
          type="date"
          placeholder={t("Date de naissance")}
          name="dateDeNaissance"
          value={formik.values.dateDeNaissance}
          onChange={formik.handleChange}
        />
        {formik.touched.dateDeNaissance && formik.errors.dateDeNaissance ? (
          <div className="error">{formik.errors.dateDeNaissance}</div>
        ) : null}
        <input
          className="input"
          type="email"
          placeholder={t("Adresse mail")}
          name="adresseMail"
          value={formik.values.adresseMail}
          onChange={formik.handleChange}
        />
        {formik.touched.adresseMail && formik.errors.adresseMail ? (
          <div className="error">{formik.errors.adresseMail}</div>
        ) : null}
        <div>
          <div>
            <input
              id="mdp"
              className="input"
              type="password"
              placeholder={t("motDePasse")}
              name="motDePasse"
              value={formik.values.motDePasse}
              onChange={formik.handleChange}
            />
            <br />
            <label className="position-relative d-inline-block text-center showpwd">
              <input type="checkbox" className="ntm" onClick={showPassword} />{" "}
              {t("afficher")}
            </label>
            {formik.touched.motDePasse && formik.errors.motDePasse ? (
              <div className="error">{formik.errors.motDePasse}</div>
            ) : null}
          </div>
          <div>
            <input
              id="mdp2"
              className="input mt-3"
              type="password"
              placeholder={t("mdpConfirm")}
              name="motDePasseConfirm"
              value={formik.values.motDePasseConfirm}
              onChange={formik.handleChange}
            />
            <br />
            <label className="position-relative d-inline-block text-center showpwd">
              <input type="checkbox" onClick={showPasswordConfirm} /> {t("afficher")}
            </label>
            {formik.touched.motDePasseConfirm &&
            formik.errors.motDePasseConfirm ? (
              <div className="error">{formik.errors.motDePasseConfirm}</div>
            ) : null}
          </div>
        </div>
        <label htmlFor="type">{t("typeCompte")}</label>
        <br></br>
        <select
          name="type"
          id="type"
          className="input"
          value={formik.values.type}
          onChange={formik.handleChange}
        >
          <option value="voyageurs">{t("voyageur")}</option>
          <option value="clientsBailleurs">{t("bailleur")}</option>
          <option value="prestataires">{t("prestataire")}</option>
        </select>

        <br></br>
        <button
          id="boutonload"
          className="btn btn-dark btn-lg mt-4 position-relative"
          type="submit"
          disabled={loading} // Disable button when loading is true
        >
          {loading ? (
            <FadeLoader color="#ffffff" size={20} className="spinner" />
          ) : (
            t("creerCompte") // Translated button text
          )}
        </button>
      </form>
    </div>
  );
};

export default Signup;
