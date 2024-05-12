import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createReservation,getCredentials, fetchAnnonceById, createFirstMessage } from "../services.js"

const PagePaiement = () => {
    const [totalCost, setTotalCost] = useState(0);
    const [numberOfNights, setNumberOfNights] = useState(0);
    const [id, setId] = useState("");
    const [arrivee, setArrivee] = useState("");
    const [depart, setDepart] = useState("");
    const [price, setPrice] = useState(0);
    const [user, setUser] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');

    useEffect(() => {
        getCredentials().then(data => {
            setUser(data);

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

            fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pId: id, 
                    numberOfNights: numberOfNights,
                }),
            })
            .then(response => response.json())
            .then(data => {
                window.location.href = data.url;
            })
            .catch((error) => {
                console.error('Error:', error);
            });

            if (success === 'true' && data) {
                const convertDate = (inputFormat) => {
                    let parts = inputFormat.split("/");
                    return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0])).toISOString().split('T')[0];
                }
                // Call createReservation after the checkout session is successful
                const reservationData = {
                        id_BienImmobilier: id,
                        id_Voyageur: data.id, // replace with actual voyageur id
                        dateDebut: convertDate(arrivee),
                        dateFin: convertDate(depart),
                        prixTotal: totalCost
                };
                console.log(reservationData.dateDebut);
                console.log(reservationData.dateFin);
                createReservation(reservationData)
                    .then(reservationResponse => {
                        console.log('Reservation created:', reservationResponse);
                    })
                    .catch(error => {
                        console.error('Error creating reservation:', error);
                    });
                    fetchAnnonceById(id)
                    .then((dataF) => {
                        console.log(dataF);
                        const messageData = {
                            id_sender: data.id,
                            id_receiver: dataF.id_ClientBailleur,
                            type_sender:data.type,
                            type_receiver:  "clientsBailleurs",
                            content: "init",
                        }
                        console.log("here.",messageData);
                        createFirstMessage(messageData)
                        .then((data) => {
                            console.log(data);
                        });
                    });
            }
        

            // Redirect after a delay, regardless of success or cancellation
            setTimeout(() => {
                navigate('/another-page');  
            }, 2000);
        });
    }, [success, canceled]);

    return (
        <div>
            {success === 'true' && <h1>Paiement accepté!</h1>}
            {canceled === 'true' && <h1>Paiement annulé</h1>}
        </div>
    );
}

export default PagePaiement;