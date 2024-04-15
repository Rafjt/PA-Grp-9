import React, { useState, useEffect } from 'react';
import './gestionUtilisateur.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';
import { fetchUsers, createUser, deleteUser } from '../services';

const GestionUtilisateur = () => {
  const [users, setUsers] = useState({
    voyageurs: [],
    clientsBailleurs: [],
    prestataires: [],
  });

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    dateDeNaissance: "",
    adresseMail: "",
    motDePasse: "",
    admin: "0",
    type: "voyageurs",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const idFields = {
    voyageurs: "id",
    clientsBailleurs: "id",
    prestataires: "id",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Handle error gracefully, such as displaying an error message or retrying the fetch
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    const data = await createUser(form);
    // window.location.reload();
  };

  const handleDelete = (userId, userType) => {
    deleteUser(userId, userType)
      .then(() => {
        setUsers((prevUsers) => ({
          ...prevUsers,
          [userType]: prevUsers[userType].filter(
            (user) => user[idFields[userType]] !== userId
          ),
        }));
      })
      .catch((error) => console.error("Error deleting user:", error));
  };

  const filteredUsers = Object.keys(users).reduce((acc, userType) => {
    const filtered = users[userType].filter(
      (user) =>
        user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.adresseMail.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...acc, [userType]: filtered };
  }, {});


  if (!users) {
    return <div>Loading...</div>;
  }

  return (
    <div className="gestionUtilisateur2">
      <div className="greet">
        <h1>Gestion des Utilisateurs</h1>
        <h2>
          Ici, vous pouvez rechercher, ajouter, modifier ou supprimer des
          utilisateurs
        </h2>
      </div>
      <div className="createUser rounded shadow">
        <h2>Ajouter un utilisateur</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Nom"
            name="nom"
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
          <input
            className="input"
            type="text"
            placeholder="Mot de passe"
            name="motDePasse"
            value={form.motDePasse}
            onChange={handleChange}
          />
          <br />
          <label htmlFor="admin">Admin :</label>
          <select
            name="admin"
            id="admin"
            value={form.admin}
            onChange={handleChange}
          >
            <option value="0">Non</option>
            <option value="1">Oui</option>
          </select>
          <br />
          <br />
          <label htmlFor="type">Type :</label>
          <select
            name="type"
            id="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="voyageurs">Voyageur</option>
            <option value="clientsBailleurs">Bailleur</option>
            <option value="prestataires">Prestataire</option>
          </select>
          <br />
          <input
            className="input shadow"
            type="submit"
            value="Créer"
            method="POST"
          ></input>
        </form>
      </div>
      <div className="search-bar mt-3">
        <input
          class="mt-3"
          className="input"
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="usersContainer rounded shadow mt-3">
        <table className="table table-bordered table-hover custom-table">
          <thead>
            <tr>
              <th className="narrow-column">ID</th>
              <th>Type</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Date de Naissance</th>
              <th>Adresse Email</th>
              <th>Mot de Passe</th>
              <th className="narrow-column">Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {["voyageurs", "clientsBailleurs", "prestataires"].map((userType) =>
              filteredUsers[userType].map((user) => (
                <tr key={user[idFields[userType]]}>
                  <td>{user[idFields[userType]]}</td>
                  <td>{userType}</td>
                  <td className="long-column">{user.nom}</td>
                  <td className="long-column">{user.prenom}</td>
                  <td>{user.dateDeNaissance}</td>
                  <td className="long-column">{user.adresseMail}</td>
                  <td className="long-column">{user.motDePasse}</td>
                  <td>{user.admin}</td>
                  <td className="long-column">
                    <button
                      onClick={() =>
                        handleDelete(user[idFields[userType]], userType)
                      }
                      className="delete"
                    >
                      Supprimer
                    </button>
                    <Link
                      className="modif"
                      to={`/update/${user[idFields[userType]]}/${userType}`}
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionUtilisateur;