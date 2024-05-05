import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./reserverBien.css";
import { fetchAnnonceById } from "../services.js";
import { BACK_URL } from "../services.js";

const ReserverBien = () => {
    const location = useLocation();
    const { id, arrivee, depart } = location.state;

    // Retrieve the price from sessionStorage and convert it to a number
    const price = Number(sessionStorage.getItem('price'));

    const arriveeString = arrivee.toLocaleDateString();
    const departString = depart.toLocaleDateString();
    const arriveeDate = new Date(arrivee);
    const departDate = new Date(depart);

    const numberOfNights = Math.ceil(Math.abs(departDate - arriveeDate) / (1000 * 60 * 60 * 24));
    const totalCost = numberOfNights * price;

    // Define a state variable to store the fetched data
    const [fetchedData, setFetchedData] = useState(null);

    useEffect(() => {
        fetchAnnonceById(id)
            .then((data) => {
                // Store the fetched data in the state variable
                setFetchedData(data);
            });
    }, [id]);

    const handleSubmit = () => {
        sessionStorage.setItem('totalCost', totalCost);
        sessionStorage.setItem('numberOfNights', numberOfNights);
        sessionStorage.setItem('id', id);
        sessionStorage.setItem('arrivee', arriveeString);
        sessionStorage.setItem('depart', departString);
        sessionStorage.setItem('price', price);
        window.location.href = "/pagePaiement";
    }

    // Check if fetchedData is null before trying to access its properties
    return (
        <div>
            <h1>Récapitulatif de la réservation</h1>
            <div className="ResaContainer">
                {fetchedData && (
                    <>
                        <img className="imgResa" src={`${BACK_URL}/uploads/${fetchedData.cheminImg}`} alt={fetchedData.nomBien} />
                        <p>{fetchedData.typeDePropriete}, {fetchedData.nomBien}</p>
                        <p>Arrivee: {arriveeString}</p>
                        <p>Depart: {departString}</p>
                        <p>Total a payer: {totalCost}€ pour {numberOfNights} nuits</p>
                        <label>
                            <input className="" type="checkbox" />
                            J'ai lu et accepte les termes et conditions du bailleurs
                        </label>
                    </>
                )}
            </div>
            <button className="btn btn-dark" onClick={handleSubmit}>Confirmer la réservation et procéder au paiement</button>
        </div>
    );
};

export default ReserverBien;
