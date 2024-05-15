import React, { useEffect, useState } from "react";
import { validatePrestataire, fetchPrestationsEnAttente,acceptPrestation,getCredentials,createFirstMessage } from "../services";
import './takePrestation.css';

function TakePrestation() {
    const [isValid, setIsValid] = useState(null);
    const [prestations, setPrestations] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        getCredentials().then(data => {
            setUser(data);
        });
    }
    , []);

    useEffect(() => { 
        validatePrestataire().then(data => {
            setIsValid(data.valide === 1);
        });
    }, []);

    useEffect(() => {
        fetchPrestationsEnAttente().then(data => {
            setPrestations(data);
            console.log(data);
        });
    }, []);

    const acceptPresta = (prestationId) => {
        acceptPrestation(prestationId).then(data => {
            if (!data) {
                console.error('No data returned from acceptPrestation');
                return;
            }

            console.log(data);

            let messageData;
            if (data.id_Voyageur) {
                messageData = { 
                    id_sender: user.id, 
                    id_receiver: data.id_Voyageur, 
                    type_sender: 'prestataires', 
                    type_receiver: 'voyageurs',
                    content: 'init'
                };
            } else if (data.id_ClientBailleur) {
                messageData = { 
                    id_sender: user.id, 
                    id_receiver: data.id_ClientBailleur, 
                    type_sender: 'prestataires', 
                    type_receiver: 'clientsBailleurs',
                    content: 'init'
                };
            }

            createFirstMessage(messageData).then(response => {
                console.log(response);
                window.location.reload();
            });
        });
    }


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

    return (
        <div>
            <h1 className="title">Me placer sur une prestations</h1>
            <hr />
            {prestations && prestations.map((prestation, index) => (
    <div key={index} className="prestation-card">
                    <h2>{prestation.nom}</h2>
                    <p>Type: <span>{prestation.typeIntervention}</span></p>
                    <p>Date: <span>{prestation.date}</span></p>
                    <p>Lieux: <span>{prestation.lieux}</span></p>
                    <p>Ville: <span>{prestation.ville}</span></p>
                    <p className="description">Description: <span>{prestation.description}</span></p>
                    <p>Statut: <span>{prestation.statut}</span></p>
                    <hr />
                    <button className="place-button" onClick={() => acceptPresta(prestation.id)}>Me placer</button>
                </div>
            ))}
        </div>
    );
}

export default TakePrestation;