import "bootstrap/dist/css/bootstrap.min.css";
import "./signup.css";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup"; // Import Yup for validation
import { createUser } from "../services";
import { FadeLoader } from "react-spinners";

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
        .matches(nomRegex, "Le nom doit contenir uniquement des lettres")
        .required("Ce champ est requis")
        .min(1, "Le nom doit contenir au moins 1 caractère")
        .max(30, "Le nom ne peut pas dépasser 30 caractères"),
      prenom: Yup.string()
        .matches(nomRegex, "Le prénom doit contenir uniquement des lettres")
        .required("Ce champ est requis")
        .min(1, "Le prénom doit contenir au moins 1 caractère")
        .max(30, "Le prénom ne peut pas dépasser 30 caractères"),
      dateDeNaissance: Yup.date()
        .required("Ce champ est requis")
        .min(minDate, "Vous devez avoir moins de 100 ans pour vous inscrire")
        .max(maxDate, "Vous devez avoir strictement 18 ans pour vous inscrire"),
      adresseMail: Yup.string()
        .matches(emailRegex, "l'adresse email n'est pas valide")
        .email("Adresse mail invalide")
        .required("Ce champ est requis")
        .max(50, "L'adresse mail ne peut pas dépasser 30 caractères"),
      motDePasse: Yup.string()
        .required("Ce champ est requis")
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .max(50, "Le mot de passe ne peut pas dépasser 30 caractères"),
      motDePasseConfirm: Yup.string()
        .oneOf(
          [Yup.ref("motDePasse"), null],
          "Les mots de passe doivent correspondre"
        )
        .required("Ce champ est requis"),
    }),
    onSubmit: async (values) => {
      var button = document.getElementById('boutonload');
      button.disabled = true;
      setLoading(true);
      const trimmedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => {
          return [key, typeof value === "string" ? value.trim() : value];
        })
      );

      try {
        await createUser(trimmedValues);
        console.log(trimmedValues);
        window.location.replace("/mailConfirm");
      } catch (error) {
        if (error.message === "Email already exists") {
          formik.setErrors({
            adresseMail:
              "Cet email est déjà utilisé. Veuillez en choisir un autre.",
          });
        } else if (error.message === "User is banned") {
          formik.setErrors({
            adresseMail:
              "Cet email a été banni, veuillez contacter l'assistance",
          });
        }
        console.error("Error creating user:", error);
      } finally {
        button.disabled = false;
        setLoading(false); // Set loading to false after the request completes
      }
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
              <b>Formulaire d'inscription</b>
            </h5>
          </div>
        </div>
      </div>
      <form onSubmit={formik.handleSubmit}>
        <input
          className="input"
          type="text"
          placeholder="Nom"
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
          placeholder="Prénom"
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
          placeholder="Date de naissance"
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
          placeholder="Adresse mail"
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
              placeholder="Mot de passe"
              name="motDePasse"
              value={formik.values.motDePasse}
              onChange={formik.handleChange}
            />
            <br />
            <label className="position-relative d-inline-block text-center showpwd">
              <input type="checkbox" className="ntm" onClick={showPassword} />{" "}
              Afficher
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
              placeholder="Confirmer le mot de passe"
              name="motDePasseConfirm"
              value={formik.values.motDePasseConfirm}
              onChange={formik.handleChange}
            />
            <br />
            <label className="position-relative d-inline-block text-center showpwd">
              <input type="checkbox" onClick={showPasswordConfirm} /> Afficher
            </label>
            {formik.touched.motDePasseConfirm &&
            formik.errors.motDePasseConfirm ? (
              <div className="error">{formik.errors.motDePasseConfirm}</div>
            ) : null}
          </div>
        </div>
        <label htmlFor="type">Type de compte :</label>
        <br></br>
        <select
          name="type"
          id="type"
          className="input"
          value={formik.values.type}
          onChange={formik.handleChange}
        >
          <option value="voyageurs">Voyageur</option>
          <option value="clientsBailleurs">Bailleur</option>
          <option value="prestataires">Prestataire</option>
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
            "Créer un compte"
          )}
        </button>
      </form>
    </div>
  );
};

export default Signup;
