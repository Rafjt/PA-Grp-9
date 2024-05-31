import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { fetchReservationById, updateReservation } from "../services";
import { Link } from 'react-router-dom';
import './updateReservation.css';

const UpdateReservation = () => {

    const { id } = useParams();

    const [initialValues, setInitialValues] = useState(null);

    const [reservationData, setReservationData] = useState(null);
    const [values, setValues] = useState({
        dateDebut: '',
        dateFin: ''
    });

    const [loading, setLoading] = useState(true);
    const hasFormChanged = () => {
        return JSON.stringify(values) !== JSON.stringify(initialValues);
    }

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setValues(prevValues => ({
            ...prevValues,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    const handleModify = async (e) => {
        e.preventDefault();
        console.log('Modifying reservation:', values);
        try {
            const data = await updateReservation(id, values);
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedData = await updateReservation(id, {
                ...values,
                dateDebut: values.dateDebut,
                dateFin: values.dateFin,
            });
            console.log('Update successful:', updatedData);
        } catch (error) {
            console.error('Error updating reservation:', error);
        }
    };
/*
    const fetchData = async () => {
        try {
            const data = await fetchReservationById(id);
            console.log(data);
            setReservationData(data);
        } catch (error) {
            console.log(error);
        }
    };

*/

const fetchData = async () => {
    try {
        const data = await fetchReservationById(id);
        if (data) {
            console.log(data);
            setReservationData(data);
            setValues({
                ...values,
                dateDebut: data.dateDebut,
                dateFin: data.dateFin
            });
            setInitialValues({
                dateDebut: data.dateDebut,
                dateFin: data.dateFin
            });
        }
    } catch (error) {
        console.log(error);
    }
};

    useEffect(() => {
        fetchData();
    }, [id]);
    

    return (
        <div className="container-fluid mt-5 mr-0 ml-0 w-100">
            {reservationData && (
                <div className="modif">
                    <form onSubmit={handleSubmit}>
                        <div className="servicesupp">
                            <h4>Services supplémentaires</h4>
                            <label>
                                Mobilier supplémentaire :
                                <input
                                    type="checkbox"
                                    name="mobilierSupp"
                                    //checked={values.mobilierSupp}
                                    onChange={handleChange}
                                />
                            </label>
                            <br />    
                            <label>
                                Formule Déjeuner :
                                <input
                                    type="checkbox"
                                    name="formuleDejeuner"
                                    //checked={values.formuleDejeuner}
                                    onChange={handleChange}
                                />
                            </label>
                        </div>
                        <div className="date-reservation">
                            <h4>Dates de réservation</h4>
                            <label>Date de début :</label>
                            <input
                                type="date"
                                name="dateDebut"
                                value={values.dateDebut}
                                onChange={handleChange}
                            />
                            <label>Date de fin :</label>
                            <input
                                type="date"
                                name="dateFin"
                                value={values.dateFin}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" onClick={handleModify} className="btn btn-dark btn-lg mt-4">Confirmer les modifications</button>
                    </form>
                </div>
            )}
            <div>
                <Link style={{
                    backgroundColor: "LightGreen",
                    color: "black",
                    borderRadius: "5px",
                    padding: "1%",
                }} to="/gestionReservations">Terminer</Link>
            </div>
        </div>
    );
    
}

export default UpdateReservation;
