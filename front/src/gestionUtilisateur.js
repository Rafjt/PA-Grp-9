import React, { useState, useEffect } from 'react';
import './gestionUtilisateur.css'

const GestionUtilisateur = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/users')
            .then(response => response.json())
            .then(data => {
                console.log('here:',data);  
                setUsers(data);
            })
            .catch(error => console.log(error));
    }, []);

    const handleDelete = (userId) => {
        
    };

    const handleModify = (userId) => {
        
    };

    return (
        <div className="gestionUtilisateur">
            <div className='greet'>
                <h1>Gestion des Utilisateurs</h1>
                <h2>Vous pouvez ajouter, modifier ou supprimer des utilisateurs</h2>
            </div>
            <div className="users">
                {users.map(user => (
                    <div key={user.ID_Voyageur} className="user">
                        <p>ID: {user.ID_Voyageur}</p>
                        <p>Nom: {user.Nom}</p>
                        <p>Prénom: {user.Prenom}</p>
                        <p>Adresse Email: {user.AdresseMail}</p>
                        <p>Mot de Passe: {user.MotDePasse}</p>
                        <p>Admin: {user.Admin}</p>
                        <button onClick={() => handleDelete(user.ID_Voyageur)}>Supprimer</button>
                        <button onClick={() => handleModify(user.ID_Voyageur)}>Modifier</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GestionUtilisateur;
