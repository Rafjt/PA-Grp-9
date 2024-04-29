import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAnnonceById,fetchReservationById } from "../services";
import { BACK_URL } from "../services";
import "./viewBien.css";



const ViewBien = () => {

    const [arrivee, setArrivee] = useState('');
    const [depart, setDepart] = useState('');

    useEffect(() => {
        let params = new URLSearchParams(window.location.search);
        setArrivee(params.get('arrivee'));
        setDepart(params.get('depart'));
    }, []);

    const today = new Date().toISOString().split('T')[0];

    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAnnonceById(id)
            .then((fetchedData) => {
                setData(fetchedData);
            });
    }, [id]);

    useEffect(() => {
        fetchReservationById(id)
            .then((reservationData) => {
                console.log("reservation",reservationData);
            });
    }, [id]);

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <div>
                <h1 className="nomDuBien">{data.nomBien}</h1>
            </div>
            <img className="photoDuBien" src={`${BACK_URL}/uploads/${data.cheminImg}`} alt={data.nomBien} />
            <p>{data.typeDePropriete} - {data.ville},{data.adresse}</p>
            <p className="assets">{data.nombreChambres} Chambres - {data.nombreLits} Lits - {data.nombreSallesDeBain} Salles de bain</p>
            <form className="resForm">
            <label htmlFor="dateDebut">Arrivée</label>
            <input type="date" id="dateDebut" name="dateDebut" className="form-control" value={arrivee} min={today} />
            <label htmlFor="dateFin">Départ</label>
            <input type="date" id="dateFin" name="dateFin" className="form-control" value={depart} min={arrivee} />
            <button className="btn btn-dark">Réserver</button>
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
        </div>
    );
}
export default ViewBien;