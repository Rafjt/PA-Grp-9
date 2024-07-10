import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { updateUser,fetchUserById } from '../services';

const Update = () => {
  const { id } = useParams();
  const { type } = useParams();
  const [values, setValues] = useState({
    nom: '',
    prenom: '',
    dateDeNaissance: '',
    adresseMail: '',
    motDePasse: '',
    type: type || 'VOYAGEURS',
    admin: '',
  });
  const [initialValues, setInitialValues] = useState({
    nom: '',
    prenom: '',
    dateDeNaissance: '',
    adresseMail: '',
    motDePasse: '',
    type: type || 'VOYAGEURS',
    admin: '',
  });

  useEffect(() => {
    fetchUserById(id, values.type)
      .then((data) => {
        console.log(data);
        setValues({
          nom: data.nom,
          prenom: data.prenom,
          dateDeNaissance: data.dateDeNaissance,
          adresseMail: data.adresseMail,
          motDePasse: data.motDePasse,
          type: values.type,
          admin: data.admin,
        });
        setInitialValues({
          nom: data.nom,
          prenom: data.prenom,
          dateDeNaissance: data.dateDeNaissance,
          adresseMail: data.adresseMail,
          motDePasse: data.motDePasse,
          type: values.type,
          admin: data.admin,
        });
      })
      .catch((error) => console.log(error));
  }, [id, values.type]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  function showPassword() {
    var x = document.getElementById("mdp");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  const handleModify = async (e) => {
    e.preventDefault();
    console.log('Modifying user:', values);
    try {
      const changedValues = Object.keys(values).reduce((acc, key) => {
        if (values[key] !== initialValues[key]) {
          acc[key] = values[key];
        }
        return acc;
      }, {});
      const data = await updateUser(id, values.type, changedValues);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <><div className="container-fluid mt-5 mr-0 ml-0 w-100">
      <div className="row">
        <div className="col">
          <div className="margin mt-2 fs-2 mb-2">
            <h5>
              <b>Modifier les données de l'utilisateur</b>
            </h5>
          </div>
        </div>
      </div>
      <form>
        <input className="input" type="text" name="nom" placeholder="Nom" value={values.nom} onChange={handleChange} />
        <input className="input" type="text" name="prenom" placeholder="Prénom" value={values.prenom} onChange={handleChange} />
        <input className="input" type="date" name="dateDeNaissance" placeholder="Date de naissance" value={values.dateDeNaissance} onChange={handleChange} />
        <input className="input" type="email" name="adresseMail" placeholder="Adresse email" value={values.adresseMail} onChange={handleChange} />
        <div>
          <div>
            <input
              id="mdp"
              className="input mt-3"
              type="password"
              name="motDePasse"
              placeholder="Mot de passe"
              value={values.motDePasse}
              onChange={handleChange} />
            <br />
            <label className="position-relative d-inline-block text-center showpwd">
              <input type="checkbox" className="ntm" onClick={showPassword} />{" "}
              Afficher
            </label>
           <br/>
            <select className="input mt-3" name="admin" value={values.admin} onChange={handleChange}>
              <option value="0">Utilisateur</option>
              <option value="1">Admin</option>
            </select>
          </div>
        </div>

        <br></br>
        <button type="submit" onClick={handleModify} className="btn btn-dark btn-lg mt-4">
          Confirmer les modifications
        </button>
      </form>
    </div><div>
        <Link style={{
          backgroundColor: "LightGreen",
          Color: "black",
          borderRadius: "5px",
          padding: "1%",
        }} to="/gestionUtilisateur">Terminer</Link>
      </div></>
  );
};

export default Update;
