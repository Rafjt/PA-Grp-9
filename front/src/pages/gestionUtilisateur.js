import React, { useState, useEffect } from 'react';
import './gestionUtilisateur.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { createUser, deleteUser } from '../services.js';

const GestionUtilisateur = () => {
    const [users, setUsers] = useState({
        voyageurs: [],
        clientsbailleurs: [],
        prestataires: [],
    });

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    };

    const [form, setForm] = useState({
        nom: '',
        prenom: '',
        adresseMail: '',
        motDePasse: '',
        admin: '0',
        type: 'VOYAGEURS',
    });

    const idFields = {
        voyageurs: 'id',
        clientsbailleurs: 'id',
        prestataires: 'id',
    };

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers()
            .then((data) => {
                console.log('here:', data);
                setUsers(data);
            })
            .catch((error) => console.log(error));
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await createUser(form);
            console.log(data);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleDelete = (userId, userType) => {
        deleteUser(userId, userType)
            .then(() => {
                setUsers((prevUsers) => ({
                    ...prevUsers,
                    [userType]: prevUsers[userType].filter((user) => user.id !== userId),
                }));
            })
            .catch((error) => console.error('Error deleting user:', error));
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleModify = () => {
        console.log("PROUT");
    }

    return (
        <div className="gestionUtilisateur">
        <div className="greet">
            <h1>Gestion des Utilisateurs</h1>
            <h2>Ici, vous pouvez rechercher, ajouter, modifier ou supprimer des utilisateurs</h2>
        </div>
        <div className="createUser">
            <h2>Ajouter un utilisateur</h2>
            <form onSubmit={handleSubmit} >
                <input
                    class="input"
                    type='text'
                    placeholder='Nom'
                    name='nom'
                    value={form.nom}
                    onChange={handleChange}
                />
                <input
                    class="input"
                    type='text'
                    placeholder='Prénom'
                    name='prenom'
                    value={form.prenom}
                    onChange={handleChange}
                />
                <input
                    class="input"
                    type='email'
                    placeholder='Adresse mail'
                    name='adresseMail'
                    value={form.adresseMail}
                    onChange={handleChange}
                />
                <input
                    class="input"
                    type='text'
                    placeholder='Mot de passe'
                    name='motDePasse'
                    value={form.motDePasse}
                    onChange={handleChange}
                />
                <br />
                <label htmlFor="admin">Admin :</label>
                <select name="admin" id="admin" value={form.admin} onChange={handleChange}>
                    <option value="0">Non</option>
                    <option value="1">Oui</option>
                </select>
                <br />
                <br />
                <label htmlFor="type">Type :</label>
                <select name="type" id="type" value={form.type} onChange={handleChange}>
                    <option value="VOYAGEURS">Voyageur</option>
                    <option value="CLIENTSBAILLEURS">Bailleur</option>
                    <option value="PRESTATAIRES">Prestataire</option>
                </select>
                <br />
                <input class="input" type="submit" value="Créer" className='submit' method='POST'></input>
            </form>
        </div>
        <h2>Rechercher un utilisateur</h2>
        <input class="input" type="text" placeholder="Rechercher (Nom/prénom)" onChange={handleSearch} />
        <div className="usersContainer">
            {['voyageurs', 'clientsbailleurs', 'prestataires'].map((userType) => (
                <div key={userType}>
                    <h2>{userType}</h2>
                    {users[userType]
                        .filter(
                            (user) =>
                                user.Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.Prenom.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user) => (
                            <div key={user[idFields[userType]]} className="user">
                                <p>ID: {user[idFields[userType]]}</p>
                                <p>Nom: {user.Nom}</p>
                                <p>Prénom: {user.Prenom}</p>
                                <p>Adresse Email: {user.AdresseMail}</p>
                                <p>Mot de Passe: {user.MotDePasse}</p>
                                <p>Admin: {user.Admin}</p>
                                <button onClick={() => handleDelete(user[idFields[userType]], userType)}>
                                    Supprimer
                                </button>
                                <button onClick={() => handleModify(user[idFields[userType]])}>
                                    Modifier
                                </button>
                            </div>
                        ))}
                </div>
            ))}
        </div>
    </div>
    );
};

export default GestionUtilisateur;
