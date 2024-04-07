import "bootstrap/dist/css/bootstrap.min.css";
import "./signup.css";
import { useState } from "react";
import { createUser } from "../services";

const Signup = () => {

  // const [users, setUsers] = useState({
  //   voyageurs: [],
  //   clientsBailleurs: [],
  //   prestataires: [],
  // });

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    dateDeNaissance: "",
    adresseMail: "",
    motDePasse: "",
    admin: "0",
    type: "voyageurs",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    //e.preventDefault();
    console.log("here");
    const data = await createUser(form);
    console.log(data);
  };

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
    <div class="container-fluid mt-5 mr-0 ml-0 w-100">
      <div class="row">
        <div class="col">
          <div class="margin mt-2 fs-2 mb-2">
            <h5>
              <b>Formulaire d'inscription</b>
            </h5>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <input
            className="input"
            type='text'
            placeholder='Nom'
            name='nom'
            value={form.nom}
            onChange={handleChange}
        />
        <input
            className="input"
            type="text"
            placeholder="Prénom"
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
        />
        <input
            className="input"
            type="date"
            placeholder="Date de naissance"
            name="dateDeNaissance"
            value={form.dateDeNaissance}
            onChange={handleChange}
        />
        <input
            className="input"
            type="email"
            placeholder="Adresse mail"
            name="adresseMail"
            value={form.adresseMail}
            onChange={handleChange}
        />
        <div>
          <div>
            <input
            id="mdp"
            className="input"
            type="password"
            placeholder="Mot de passe"
            name="motDePasse"
            value={form.motDePasse}
            onChange={handleChange}
            />
            <br />
            <label class="position-relative d-inline-block text-center showpwd">
              <input type="checkbox" class="ntm" onClick={showPassword} />{" "}
              Afficher
            </label>
          </div>
          <div>
            <input
              id="mdp2"
              class="input mt-3"
              type="password"
              placeholder="Confirmer le mot de passe"
            />
            <br />
            <label class="position-relative d-inline-block text-center showpwd">
              <input type="checkbox" onClick={showPasswordConfirm} /> Afficher
            </label>
          </div>
        </div>
        <label htmlFor="type">Type de compte :</label>
        <br></br>
        <select
          name="type"
          id="type"
          class="input"
          value={form.type}
          onChange={handleChange}
        >
          <option value="voyageurs">Voyageur</option>
          <option value="clientsBailleurs">Bailleur</option>
          <option value="prestataires">Prestataire</option>
        </select>

        <br></br>
        <button
          className="input"
          type="submit"
          class="btn btn-dark btn-lg mt-4"
        >
          Créer un compte
        </button>
      </form>
    </div>
  );
};

export default Signup;
