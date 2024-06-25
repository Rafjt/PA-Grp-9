import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./reserverBien.css";
import { fetchAnnonceById, createCheckoutSession } from "../services.js";
import { BACK_URL, BASE_URL } from "../services.js";

const ReserverBien = () => {
    const location = useLocation();
    const { id, arrivee, depart, pId } = location.state;
    const [isErrorVisible, setErrorVisible] = useState(false);

    // Retrieve the price from sessionStorage and convert it to a number
    const price = Number(sessionStorage.getItem('price'));
    console.log(pId);


    const arriveeString = arrivee.toLocaleDateString();
    const departString = depart.toLocaleDateString();
    const arriveeDate = new Date(arrivee);
    const departDate = new Date(depart);

    const numberOfNights = Math.ceil(Math.abs(departDate - arriveeDate) / (1000 * 60 * 60 * 24));
    const totalCost = numberOfNights * price;
    console.log(numberOfNights);
    const [isChecked, setIsChecked] = useState(false);
    const [fetchedData, setFetchedData] = useState(null);

    useEffect(() => {
        fetchAnnonceById(id)
            .then((data) => {
                // Store the fetched data in the state variable
                setFetchedData(data);
            });
    }, [id]);

    const handleSubmit = async () => {
        if (!isChecked) {
            setErrorVisible(true);
            return;
        }
        sessionStorage.setItem('totalCost', totalCost);
        sessionStorage.setItem('numberOfNights', numberOfNights);
        sessionStorage.setItem('id', id);
        sessionStorage.setItem('arrivee', arriveeString);
        sessionStorage.setItem('depart', departString);
        sessionStorage.setItem('price', price);

        const createCheckoutSession = async () => {
            const response = await fetch(`${BASE_URL}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pId, numberOfNights })
            });

            if (response.ok) {
                const session = await response.json();
                window.location.href = session.url;
            } else {
                console.error('Failed to create checkout session');
            }
        }

        // Call the function
        await createCheckoutSession();
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
                            <input type="checkbox" onChange={(e) => setIsChecked(e.target.checked)} />
                            J'ai lu et accepte les termes et conditions du bailleurs
                            <div>
                                {isErrorVisible && <p className="errResa">Veuillez valider le champ ci-dessus avant de procéder au paiement</p>}
                            </div>
                        </label>
                    </>
                )}
            </div>
            <button className="btn btn-dark" onClick={handleSubmit}>Confirmer la réservation et procéder au paiement</button>
        </div>
    );
};

export default ReserverBien;
