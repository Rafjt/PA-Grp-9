import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PagePaiement = () => {
    const [totalCost, setTotalCost] = useState(0);
    const [numberOfNights, setNumberOfNights] = useState(0);
    const [id, setId] = useState("");
    const [arrivee, setArrivee] = useState("");
    const [depart, setDepart] = useState("");
    const [price, setPrice] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');

    useEffect(() => {
        // Retrieve the values from session storage and update the state variables
        const totalCost = sessionStorage.getItem('totalCost');
        const numberOfNights = sessionStorage.getItem('numberOfNights');
        const id = sessionStorage.getItem('id');
        const arrivee = sessionStorage.getItem('arrivee');
        const depart = sessionStorage.getItem('depart');
        const price = sessionStorage.getItem('price');

        setTotalCost(totalCost);
        setNumberOfNights(numberOfNights);
        setId(id);
        setArrivee(arrivee);
        setDepart(depart);
        setPrice(price);

        // Fetch checkout session and redirect to Stripe checkout
        fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pId: id, // Use the id from session storage as the price ID
                numberOfNights: numberOfNights,
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Redirect to Stripe checkout
            window.location.href = data.url;
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        // Redirect to another page after 2 seconds
        if (success === 'true' || canceled === 'true') {
            setTimeout(() => {
                navigate('/another-page'); // Replace '/another-page' with the path of the page you want to redirect to
            }, 2000);
        }
    }, [success, canceled]);

    return (
        <div>
            {success === 'true' && <h1>Paiement accepté!</h1>}
            {canceled === 'true' && <h1>Paiement annulé</h1>}
            {/* <p>Total Cost: {totalCost}</p>
            <p>Number of Nights: {numberOfNights}</p>
            <p>ID: {id}</p>
            <p>Arrival: {arrivee}</p>
            <p>Departure: {depart}</p>
            <p>Price: {price}</p> */}
        </div>
    );
}

export default PagePaiement;