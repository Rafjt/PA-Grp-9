import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { fetchAnnonceById, updateAnnonce } from "../services"; 
import { Link } from 'react-router-dom';

const UpdateAnnonce = () => {

    const { id } = useParams();

    const [initialValues, setInitialValues] = useState(null);

    const [annonceData, setAnnonceData] = useState(null);
    const [values, setValues] = useState({
        description: '',
        nomBien: '',
        cheminImg: '', // Use cheminImg here
        disponible: 'non',
        id_ClientBailleur: '',
        prix: '',
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:3001/api/bienimo/${id}`)
            .then((response) => response.json())
            .then((data) => {
                if (loading) {
                    const initialData = {
                        description: data.description,
                        nomBien: data.nomBien,
                        cheminImg: data.cheminImg,
                        disponible: data.disponible,
                        id_ClientBailleur: data.id_ClientBailleur,
                        prix: data.prix,
                    };
                    setValues(initialData);
                    setInitialValues(initialData);
                    setLoading(false);
                }
            });
    }, [id, loading]);

    const hasFormChanged = () => {
        return JSON.stringify(values) !== JSON.stringify(initialValues);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value,
        });
    }

    const handleModify = async (e) => {
        e.preventDefault();
        console.log('Modifying annonce:', values);
        try {
            const data = await updateAnnonce(id, values); 
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchData = async () => {
        try {
            const data = await fetchAnnonceById(id);
            console.log(data);
            setAnnonceData(data);
        } catch (error) {
            console.log(error);
        }
    };


        useEffect(() => {
            fetchData();
        }, [id]); 

        return (
            <div className="container-fluid mt-5 mr-0 ml-0 w-100">
                <div className="row">
                    <div className="col">
                        <div className="margin mt-2 fs-2 mb-2">
                            <h5>
                                <b>Modifier l'annonce</b>
                            </h5>
                        </div>
                    </div>
                </div>
                {annonceData && (
                    <form>
                        <input className="input" type="text" name="nomBien" placeholder="Nom Bien" value={values.nomBien} onChange={handleChange} />
                        <input className="input" type="text" name="description" placeholder="description" value={values.description} onChange={handleChange} />
                        <input className="input" type="text" name="cheminImg" placeholder="Chemin Image" value={values.cheminImg} onChange={handleChange} />
                        <input className="input" type="number" name="prix" placeholder="prix" value={values.prix} onChange={handleChange}/>
                        <br></br>
                        <label htmlFor="disponible">Disponible :</label>
                        <select
                            name="disponible"
                            id="disponible"
                            value={values.disponible}
                            onChange={handleChange}>
                            <option value="1">Oui</option>
                            <option value="0">Non</option>
                        </select>
                        <br></br>
                        <button type="submit" onClick={handleModify} className="btn btn-dark btn-lg mt-4" disabled={!hasFormChanged()}>
                            Confirmer les modifications
                        </button>
                    </form>
                )}
                <div>
                    <Link style={{
                        backgroundColor: "LightGreen",
                        Color: "black",
                        borderRadius: "5px",
                        padding: "1%",
                    }} to="/gestionAnnonce">Terminer</Link>
                </div>
            </div>
        );
    }

    export default UpdateAnnonce;
