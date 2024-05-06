import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAnnonceById, fetchDisabledDates, createReservation } from "../services";
import { BACK_URL } from "../services";
import "./viewBien.css";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from "react-router-dom";

const ViewBien = () => {
    const navigate = useNavigate();
    const [arrivee, setArrivee] = useState(new Date());
    const [depart, setDepart] = useState(new Date());
    const [disabledDates, setDisabledDates] = useState([]);
    const today = new Date().toISOString().split('T')[0];
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAnnonceById(id)
            .then((fetchedData) => {
                setData(fetchedData);
            });
    }, [id]);


    const handleReserve = () => {
        sessionStorage.setItem('price', data.prix);
        sessionStorage.setItem('pId', data.productId);
        navigate('/reservation', { state: { id, arrivee, depart, prix: data.prix,pId: data.productId } });
    };


    useEffect(() => {
        let params = new URLSearchParams(window.location.search);
        setArrivee(new Date(params.get('arrivee')));
        setDepart(new Date(params.get('depart')));

        // Fetch disabled dates from your API and set them in the state
        fetchDisabledDates(id).then((dates) => {
            if (Array.isArray(dates)) {
                // Create an array of Date objects from the dateDebut and dateFin properties
                const disabledDatesArray = dates.reduce((acc, curr) => {
                    let startDate = new Date(curr.dateDebut);
                    let endDate = new Date(curr.dateFin);

                    // Set the time to the start of the day
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(0, 0, 0, 0);

                    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                        acc.push(new Date(d));
                    }
                    return acc;
                }, []);
                setDisabledDates(disabledDatesArray);
            } else {
                console.error('Dates is not an array:', dates);
            }
        });
    }, []);


    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     createReservation(id, arrivee, depart,)
    //         .then((res) => {
    //             if (res.status === 200) {
    //                 alert('Reservation created successfully');
    //             } else {
    //                 alert('Error creating reservation');
    //             }
    //         });
    // };


    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div className="containerViewBien">
            {data ? (
                <>
                    <div>
                        <h1 className="nomDuBien">{data.nomBien}</h1>
                    </div>
                    <img className="photoDuBien" src={`${BACK_URL}/uploads/${data.cheminImg}`} alt={data.nomBien} />
                    <p>{data.typeDePropriete} - {data.ville},{data.adresse}</p>
                    <p className="assets">{data.nombreChambres} Chambres - {data.nombreLits} Lits - {data.nombreSallesDeBain} Salles de bain</p>
                    <form className="resForm" >
                        <p>Total: <strong>{Math.ceil(Math.abs(depart - arrivee) / (1000 * 60 * 60 * 24)) * data.prix}€</strong> pour {Math.ceil(Math.abs(depart - arrivee) / (1000 * 60 * 60 * 24))} nuits</p>
                        <label htmlFor="dateDebut">Arrivée</label>
                        <DatePicker 
                            selected={arrivee} 
                            onChange={date => {
                                if (date <= depart) {
                                    setArrivee(date);
                                } else {
                                    setArrivee(depart);
                                }
                            }}
                            onBlur={e => {
                                const date = new Date(e.target.value);
                                if (date > depart) {
                                    setArrivee(depart);
                                }
                            }}
                            shouldCloseOnSelect={true}
                            minDate={new Date()} 
                            excludeDates={disabledDates} 
                        />
                        <label htmlFor="dateFin">Départ</label>
                        <DatePicker
                            selected={depart}
                            onChange={date => {
                                if (date >= arrivee) {
                                    const rangeIncludesDisabledDate = disabledDates.some(disabledDate => {
                                        return disabledDate >= arrivee && disabledDate <= date;
                                    });
                                    if (!rangeIncludesDisabledDate) {
                                        setDepart(date);
                                        setShowErrorMessage(false);
                                    } else {
                                        setShowErrorMessage(true);
                                    }
                                } else {
                                    setDepart(arrivee);
                                }
                            }}
                            onBlur={e => {
                                const date = new Date(e.target.value);
                                if (date < arrivee) {
                                    setDepart(arrivee);
                                }
                            }}
                            shouldCloseOnSelect={true}
                            minDate={arrivee} // Change this line
                            excludeDates={disabledDates}
                        />
                        {showErrorMessage && <div class="alert alert-danger">
                            <strong>Attention!</strong> Vous ne pouvez pas sélectionner une date déjà réservée.
                        </div>}
                        <button className="btn btn-dark" onClick={handleReserve}>Réserver</button>
                    </form>
                    <hr />
                    <p><strong>{data.prix}€</strong> par nuits</p>
                    <p>{data.description}</p>
                    <hr />
                    <p>Equipements:</p>
                    <table className="equipment-table">
                        <tr>
                            <th>wifi</th>
                            <td>{data.wifi == 1 ? "oui" : "non"}</td>
                        </tr>
                        <tr>
                            <th>Cuisine</th>
                            <td>{data.cuisine == 1 ? "oui" : "non"}</td>
                        </tr>
                        <tr>
                            <th>Balcon</th>
                            <td>{data.balcon == 1 ? "oui" : "non"}</td>
                        </tr>
                        <tr>
                            <th>Jardin</th>
                            <td>{data.jardin == 1 ? "oui" : "non"}</td>
                        </tr>
                        <tr>
                            <th>Parking</th>
                            <td>{data.parking == 1 ? "oui" : "non"}</td>
                        </tr>
                        <tr>
                            <th>Piscine</th>
                            <td>{data.piscine == 1 ? "oui" : "non"}</td>
                        </tr>
                        <tr>
                            <th>Jaccuzzi</th>
                            <td>{data.jaccuzzi == 1 ? "oui" : "non"} </td>
                        </tr>
                        <tr>
                            <th>Salle de sport</th>
                            <td>{data.salleDeSport == 1 ? "oui" : "non"}</td>
                        </tr>
                        <tr>
                            <th>Climatisation</th>
                            <td>{data.climatisation == 1 ? "oui" : "non"}</td>
                        </tr>
                    </table>
                    <hr />
                </>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};
export default ViewBien;