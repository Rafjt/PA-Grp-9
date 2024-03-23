import React, { useState, useEffect } from 'react';
import './gestionUtilisateur.css';

const GestionUtilisateur = () => {
    const [users, setUsers] = useState({
        voyageurs: [],
        clientsbailleurs: [],
        prestataires: [],
    });
    const [searchTerm, setSearchTerm] = useState('');

    const idFields = {
        voyageurs: 'id',
        clientsbailleurs: 'id',
        prestataires: 'id',
    };

    useEffect(() => {
        fetch('http://localhost:3001/api/users')
            .then((response) => response.json())
            .then((data) => {
                console.log('here:', data);
                setUsers(data);
            })
            .catch((error) => console.log(error));
    }, []);

    const handleDelete = (userId, userType) => {
        fetch(`http://localhost:3001/api/users/${userType}/${userId}`, { method: 'DELETE' })
        .then((response) => {
            if (response.ok) {
                // Delete operation successful, update the state to reflect changes
                setUsers((prevUsers) => ({
                    ...prevUsers,
                    [userType]: prevUsers[userType].filter((user) => user[idFields[userType]] !== userId),
                }));
            } else {
                throw new Error('Failed to delete user');
            }
        })
        .catch((error) => console.error('Error deleting user:', error));
    };

    const handleModify = (userId) => {};

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="gestionUtilisateur">
            <div className="greet">
                <h1>Gestion des Utilisateurs</h1>
                <h2>Ici, vous pouvez rechercher, ajouter, modifier ou supprimer des utilisateurs</h2>
            </div>
            <input type="text" placeholder="Rechercher (Nom/prénom)" onChange={handleSearch} />
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