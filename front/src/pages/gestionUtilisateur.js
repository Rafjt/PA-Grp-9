import React, { useState, useEffect } from "react";
import "./gestionUtilisateur.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import {
  fetchUsers,
  createUser,
  deleteUser,
  banUser,
  fetchBannedUsers,
  unbanUser,
} from "../services";

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

  const [bannedUsers, setBannedUsers] = useState([]);

  const idFields = {
    voyageurs: "id",
    clientsBailleurs: "id",
    prestataires: "id",
  };

  function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
        const donnee = await fetchBannedUsers();
        setBannedUsers(donnee);
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

  const filteredUsers = Object.keys(users).reduce((acc, userType) => {
    const filtered = users[userType].filter(
      (user) =>
        user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.adresseMail.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...acc, [userType]: filtered };
  }, {});

  const handleDelete = async (userId, userType) => {
    try {
      await deleteUser(userId, userType);
      // Fetch updated data after deleting user
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleBan = async (userId, userType, userData) => {
    try {
      // Ban the user
      await banUser(userId, userType, userData);
      // Fetch updated users after banning
      const updatedUsers = await fetchUsers();
      setUsers({
        ...users,
        [userType]: updatedUsers[userType],
      });

      // Fetch updated banned users after banning
      const updatedBannedUsers = await fetchBannedUsers();
      setBannedUsers(updatedBannedUsers);
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  const unBan = async (userId) => {
    try {
      await unbanUser(userId);
      // Fetch updated data after unbanning user
      const updatedBannedUsers = await fetchBannedUsers();
      setBannedUsers(updatedBannedUsers);
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
  };
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
      <div className="usersContainer rounded shadow mt-3 tableWrapper">
      <div className="table-responsive">
        <table className="table table-bordered table-hover custom-table style={{ maxHeight: '500px', overflowY: 'auto' }}">
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
              {["voyageurs", "clientsBailleurs", "prestataires"].map(
                (userType) =>
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

                        <button
                          onClick={() =>
                            handleBan(
                              user[idFields[userType]],
                              userType,
                              user // Pass user data to the handleBan function
                            )
                          }
                          className="bannir ml-1"
                        >
                          Bannir
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
        </table>
        </div>
      </div>

      <div className="greet">
        <h2>Utilisateurs bannis</h2>
      </div>
      <div className="usersBannisContainer rounded shadow mt-3 tableWrapper">
        <div className="table-responsive">
          <table className="table table-bordered table-hover custom-table style={{ maxHeight: '500px', overflowY: 'auto' }}">
            <thead>
              <tr>
                <th className="narrow-column">ID</th>
                <th className="seminarrow-column">Nom</th>
                <th className="seminarrow-column">Prénom</th>
                <th>Adresse Email</th>
                <th className="seminarrow-column">Date de bannissement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bannedUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nom}</td>
                  <td>{user.prenom}</td>
                  <td className="long-column">{user.adresseMail}</td>
                  <td>{formatDate(user.dateBanissement)}</td>
                  <td>
                    <button
                      onClick={() => unBan(user.id)}
                      className="bannir ml-1"
                    >
                      Débannir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionUtilisateur;
