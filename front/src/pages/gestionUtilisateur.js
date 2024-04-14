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
        nom: '',
        prenom: '',
        dateDeNaissance: '',
        adresseMail: '',
        motDePasse: '',
        admin: '0',
        type: 'voyageurs',
      });
    
      const [searchTerm, setSearchTerm] = useState('');
    
      const idFields = {
        voyageurs: 'id',
        clientsBailleurs: 'id',
        prestataires: 'id',
      };
    
      useEffect(() => {
        const fetchData = async () => {
          try {
            const data = await fetchUsers();
            setUsers(data);
          } catch (error) {
            console.error('Error fetching users:', error);
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
          .catch((error) => console.error('Error deleting user:', error));
      };
    
      const handleSearch = (event) => {
        setSearchTerm(event.target.value);
      };
    
      if (!users) {
        return <div>Loading...</div>;
      }
  return (
    <div className="gestionUtilisateur">
      <div className="greet">
        <h1>Gestion des Utilisateurs</h1>
        <h2>
          Ici, vous pouvez rechercher, ajouter, modifier ou supprimer des
          utilisateurs
        </h2>
      </div>
      <div className="createUser">
        <h2>Ajouter un utilisateur</h2>
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
            className="input"
            type="submit"
            value="Créer"
            method="POST"
          ></input>
        </form>
      </div>
      <h2>Rechercher un utilisateur</h2>
      <input
        className="input"
        type="text"
        placeholder="Rechercher (Nom/prénom)"
        onChange={handleSearch}
      />
      <div className="usersContainer">
        {["voyageurs", "clientsBailleurs", "prestataires"].map((userType) => (
          <div key={userType}>
            <h2>{userType}</h2>
            {users[userType]
              .filter(
                (user) =>
                  user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.prenom.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((user) => (
                <div key={user[idFields[userType]]} className="user">
                  <p>ID: {user[idFields[userType]]}</p>
                  <p>Nom: {user.nom}</p>
                  <p>Prénom: {user.prenom}</p>
                  <p>Date de Naissance: {user.dateDeNaissance}</p>
                  <p>Adresse Email: {user.adresseMail}</p>
                  <p>Mot de Passe: {user.motDePasse}</p>
                  <p>Admin: {user.admin}</p>
                  <button
                    onClick={() =>
                      handleDelete(user[idFields[userType]], userType)
                    }
                  >
                    Supprimer
                  </button>
                  <Link
                    className="modif"
                    to={`/update/${user[idFields[userType]]}/${userType}`}
                  >
                    Modifier
                  </Link>
                  {/* <button onClick={() => handleModify(user[idFields[userType]], userType, user.admin, user.nom, user.prenom, user.adresseMail, user.motDePasse)}>
                                                Modifier
                                            </button> */}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionUtilisateur;