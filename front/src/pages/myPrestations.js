import React, { useEffect, useState } from "react";
import { validatePrestataire, fetchPrestationsById } from "../services";
import './myPrestations.css';

function MyPrestations() {
    const [isValid, setIsValid] = useState(null);
    const [prestations, setPrestations] = useState([]);

    useEffect(() => {
        validatePrestataire().then(data => {
            setIsValid(data.valide === 1);
        });
    }, []);

    useEffect(() => {
        fetchPrestationsById().then(data => {
            setPrestations(data);
        });
    }, []);

    if (isValid === null) {
        return <div>Loading...</div>;
    }

    if (!isValid) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #f5c6cb',
                marginBottom: '25%',
                marginTop: '25%',
            }}>
                <h1 style={{ fontSize: '1.5em', margin: '0' }}>Votre compte n'est pas encore validé.</h1>
                <h2 style={{ fontSize: '1.2em', margin: '0' }}>Veuillez attendre que l'administrateur valide votre compte.</h2>
                <img src="/Lock.png" alt="warning" style={{ width: '100px', margin: '20px 0' }} />
            </div>
        );
    }

    const acceptedPrestations = prestations.filter(prestation => prestation.statut === 'ACCEPTÉE');
    const finishedPrestations = prestations.filter(prestation => prestation.statut === 'TERMINÉ');

    const handleContact = () => {
        window.location.replace('/espaceDiscussion');
    };

    return (
        <div>
            <h1>Mes Prestations</h1>
            <hr />
            <h2>Acceptées</h2>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Lieux</th>
                        <th>Ville</th>
                        <th>Type d'intervention</th>
                        <th>Action</th> {/* New cell */}
                    </tr>
                </thead>
                <tbody>
                    {acceptedPrestations.map((prestation, index) => (
                        <tr key={index}>
                            <td>{prestation.nom}</td>
                            <td>{prestation.description}</td>
                            <td>{prestation.date}</td>
                            <td>{prestation.lieux}</td>
                            <td>{prestation.ville}</td>
                            <td>{prestation.typeIntervention}</td>
                            <td onClick={handleContact}>Contacter le client</td> {/* New cell */}
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2>Terminées</h2>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Lieux</th>
                        <th>Ville</th>
                        <th>Type d'intervention</th>
                        <th>Action</th> {/* New cell */}
                    </tr>
                </thead>
                <tbody>
                    {finishedPrestations.map((prestation, index) => (
                        <tr key={index} className="finished-row">
                            <td>{prestation.nom}</td>
                            <td>{prestation.description}</td>
                            <td>{prestation.date}</td>
                            <td>{prestation.lieux}</td>
                            <td>{prestation.ville}</td>
                            <td>{prestation.typeIntervention}</td>
                            <td>
                                <div style={{ cursor: 'pointer'}} onClick={handleContact} className="contactClient">
                                    Contacter le client
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MyPrestations;