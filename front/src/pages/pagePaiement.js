import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createReservation, getCredentials, fetchAnnonceById, createFirstMessage, BACK_URL, createFinance } from "../services.js";
import { jsPDF } from "jspdf";
import axios from "axios";

const PagePaiement = () => {
    const [totalCost, setTotalCost] = useState(0);
    const [numberOfNights, setNumberOfNights] = useState(0);
    const [id, setId] = useState("");
    const [arrivee, setArrivee] = useState("");
    const [depart, setDepart] = useState("");
    const [price, setPrice] = useState(0);
    const [user, setUser] = useState(null);
    const [pId, setPId] = useState("");

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
            const pId = sessionStorage.getItem('pId');

            setTotalCost(totalCost);
            setNumberOfNights(numberOfNights);
            setId(id);
            setArrivee(arrivee);
            setDepart(depart);
            setPrice(price);
            setPId(pId);

            if (success === 'true' && data) {
                const convertDate = (inputFormat) => {
                    let parts = inputFormat.split("/");
                    return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0])).toISOString().split('T')[0];
                }
                const reservationData = {
                    id_BienImmobilier: id,
                    id_Voyageur: data.id,
                    dateDebut: convertDate(arrivee),
                    dateFin: convertDate(depart),
                    prixTotal: totalCost
                };
                createReservation(reservationData)
                    .then(reservationResponse => {
                        console.log('Reservation created:', reservationResponse);

                        fetchAnnonceById(id)
                            .then((dataF) => {
                                console.log(dataF);

                                const messageData = {
                                    id_sender: data.id,
                                    id_receiver: dataF.id_ClientBailleur,
                                    type_sender: data.type,
                                    type_receiver: "clientsBailleurs",
                                    content: "init",
                                }
                                console.log("here.", messageData);
                                createFirstMessage(messageData)
                                    .then((data) => {
                                        console.log(data);
                                    });

                                // Create a new PDF
                                const doc = new jsPDF();
                                const imgData = './logopcsnobg.png';
                                // Add an image (logo)
                                doc.addImage(imgData, 'PNG', 165, 10, 30, 30);

                                // Title
                                doc.setFontSize(26);
                                doc.setFont("helvetica", "bold");
                                doc.setTextColor(0, 0, 0);
                                doc.text("Facture", 105, 20, null, null, 'center');

                                // Horizontal Line
                                doc.setLineWidth(0.5);
                                doc.line(20, 40, 190, 40);

                                // Subtitles
                                doc.setFontSize(20);
                                doc.setFont("helvetica", "bold");
                                doc.setTextColor(0, 0, 0);
                                doc.text("Informations sur la facture", 20, 50);

                                // Text
                                doc.setFontSize(16);
                                doc.setFont("helvetica", "normal");
                                doc.setTextColor(50);
                                const yOffset = 10; // Vertical space between lines

                                doc.text(`Réservation passé le : ${new Date().toLocaleDateString('fr-FR')}`, 20, 70);
                                doc.text(`Client: ${data.prenom} ${data.nom}`, 20, 70 + yOffset);
                                doc.text(`Coût total: ${totalCost.toLocaleString('fr-FR')} €`, 20, 70 + 2 * yOffset);
                                doc.text(`Nombre de nuits: ${numberOfNights}`, 20, 70 + 3 * yOffset);
                                doc.text(`Prix par nuit: ${price.toLocaleString('fr-FR')} €`, 20, 70 + 4 * yOffset);

                                // Footer
                                doc.setLineWidth(0.5);
                                doc.line(20, 270, 190, 270); // Footer line
                                doc.setFontSize(12);
                                doc.setFont("helvetica", "italic");
                                doc.setTextColor(100);
                                doc.text("Merci pour votre réservation!", 105, 280, null, null, 'center');

                                // Save the PDF
                                const timestamp = Date.now();
                                const pdfFileName = `facture_${timestamp}_${data.id}.pdf`;
                                const pdfBlob = doc.output('blob');

                                const formData = new FormData();
                                formData.append('file', pdfBlob, pdfFileName);

                                axios.post(`${BACK_URL}/api/save-pdf`, formData, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data'
                                    },
                                })
                                    .then(() => {
                                        // Create financeData object
                                        const financeData = {
                                            id_ClientBailleur: dataF.id_ClientBailleur,
                                            id_Prestataire: null,
                                            id_Voyageur: data.id,
                                            type: 'facture',
                                            montant: totalCost,
                                            dateTransaction: new Date().toISOString().split('T')[0],
                                            nomDocument: pdfFileName,
                                        };

                                        // Call createFinance function
                                        createFinance(financeData)
                                            .then(financeResponse => {
                                                console.log('Finance created:', financeResponse);
                                            })
                                            .catch(error => {
                                                console.error('Error creating finance:', error);
                                            });
                                    });

                            });
                    })
                    .catch(error => {
                        console.error('Error creating reservation:', error);
                    });

                // Redirect after a delay, regardless of success or cancellation
                setTimeout(() => {
                    navigate('/mesReservations');
                }, 2000);
            } else if (canceled === 'true') {
                // Handle canceled payment
                setTimeout(() => {
                    navigate('/mesReservations');
                }, 2000);
            } else {
                // Create checkout session only if not redirected from success or canceled
                fetch(`${BACK_URL}/api/create-checkout-session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        pId: pId,
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
            }
        });
    }, [success, canceled, navigate]);

    return (
        <div>
            {success === 'true' && <h1>Paiement accepté!</h1>}
            {canceled === 'true' && <h1>Paiement annulé</h1>}
        </div>
    );
}

export default PagePaiement;
