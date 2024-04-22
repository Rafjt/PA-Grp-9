import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { fetchAnnonceById, updateAnnonce } from "../services";
import { Link } from 'react-router-dom';
import './updateAnnonce.css';
const BACK_URL = 'http://localhost:3001';

const UpdateAnnonce = () => {

    const { id } = useParams();

    const [initialValues, setInitialValues] = useState(null);

    const [annonceData, setAnnonceData] = useState(null);
    const [values, setValues] = useState({
        description: '',
        nomBien: '',
        statutValidation: '',
        cheminImg: null,
        disponible: '1', // default value set to "Oui"
        id: '',
        id_ClientBailleur: '',
        prix: '',
        typeDePropriete: 'Maison',
        nombreChambres: 0,
        nombreLits: 0,
        nombreSallesDeBain: 0,
        wifi: 0,
        cuisine: 0,
        balcon: 0,
        jardin: 0,
        parking: 0,
        piscine: 0,
        jaccuzzi: 0,
        salleDeSport: 0,
        climatisation: 0
    });

    const [loading, setLoading] = useState(true);

    const [file, setFile] = useState(null);

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
                        typeDePropriete: data.typeDePropriete,
                        nombreChambres: data.nombreChambres,
                        nombreLits: data.nombreLits,
                        nombreSallesDeBain: data.nombreSallesDeBain,
                        wifi: data.wifi,
                        cuisine: data.cuisine,
                        balcon: data.balcon,
                        jardin: data.jardin,
                        parking: data.parking,
                        piscine: data.piscine,
                        jaccuzzi: data.jaccuzzi,
                        salleDeSport: data.salleDeSport,
                        climatisation: data.climatisation

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
        if (e.target.type === 'file') {
            // Update both the file state and the values state
            setFile(e.target.files[0]);
            setValues({
                ...values,
                [name]: e.target.files[0],
            });
        } else {
            setValues({
                ...values,
                [name]: value,
            });
        }
    }

/*
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log('name:', name, 'value:', value);
        setValues({
            ...values,
            [name]: value,
        e.preventDefault();
        console.log('Modifying annonce:', values);
        try {
            const data = await updateAnnonce(id, values); 
            console.log(data);
        } catch (error) {
            console.log(error);
    };
    */

    const handleModify = async (e) => {
        e.preventDefault();
        console.log('Modifying annonce:', values);
        try {
            const data = await updateAnnonce(id, values, values.cheminImg);
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
                <form className="modif">
                    <img src={`${BACK_URL}/uploads/${values.cheminImg}`} alt={`${values.nomBien}`} />
                    <br></br>
                    <label htmlFor="cheminImg">Modifier l'image :</label>
                    <input type="file" name="cheminImg" onChange={handleChange} />
                    <br></br> 
                    <input className="input" type="text" name="nomBien" placeholder="Nom Bien" value={values.nomBien} onChange={handleChange} />
                    <input className="input" type="text" name="description" placeholder="description" value={values.description} onChange={handleChange} />
                    <input className="input" type="number" name="prix" placeholder="prix" value={values.prix} onChange={handleChange} />
                    <input className="input" type="number" name="id_ClientBailleur" placeholder="id_ClientBailleur" value={values.id_ClientBailleur} onChange={handleChange} />
                    <br></br>
                    <label htmlFor="typeDePropriete">Type de propriété :</label>
                    <select
                        name="typeDePropriete"
                        id="typeDePropriete"
                        value={values.typeDePropriete}
                        onChange={handleChange}>
                        <option value="Maison">Maison</option>
                        <option value="Appartement">Appartement</option>
                        <option value="Maison d'hôtes">Maison d'hôtes</option>
                        <option value="Hôtel">Hôtel</option>
                    </select>
                    <br></br>
                    <input className="input" type="number" name="nombreChambres" placeholder="nombreChambres" value={values.nombreChambres} onChange={handleChange} />
                    <input className="input" type="number" name="nombreLits" placeholder="nombreLits" value={values.nombreLits} onChange={handleChange} />
                    <input className="input" type="number" name="nombreSallesDeBain" placeholder="nombreSallesDeBain" value={values.nombreSallesDeBain} onChange={handleChange} />
                    <br></br>
                    <label htmlFor="wifi">Wifi :</label>
                    <select
                        name="wifi"
                        id="wifi"
                        value={values.wifi}
                        onChange={handleChange}>
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                    <label htmlFor="cuisine">Cuisine :</label>
                    <select
                        name="cuisine"
                        id="cuisine"
                        value={values.cuisine}
                        onChange={handleChange}>
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                    <label htmlFor="balcon">Balcon :</label>
                    <select
                        name="balcon"
                        id="balcon"
                        value={values.balcon}
                        onChange={handleChange}>
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                    <label htmlFor="jardin">Jardin :</label>
                    <select
                        name="jardin"
                        id="jardin"
                        value={values.jardin}
                        onChange={handleChange}>
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                    <br></br>
                    <label htmlFor="parking">Parking :</label>
                    <select
                        name="parking"
                        id="parking"
                        value={values.parking}
                        onChange={handleChange}>
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                    <label htmlFor="piscine">Piscine :</label>
                    <select
                        name="piscine"
                        id="piscine"
                        value={values.piscine}
                        onChange={handleChange}>
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                    <label htmlFor="jaccuzzi">Jaccuzzi :</label>
                    <select
                        name="jaccuzzi"
                        id="jaccuzzi"
                        value={values.jaccuzzi}
                        onChange={handleChange}>
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                    <label htmlFor="salleDeSport">Salle de sport :</label>
                    <select
                        name="salleDeSport"
                        id="salleDeSport"
                        value={values.salleDeSport}
                        onChange={handleChange}>
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                    <br></br>
                    <label htmlFor="climatisation">Climatisation :</label>
                    <select
                        name="climatisation"
                        id="climatisation"
                        value={values.climatisation}
                        onChange={handleChange}>
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
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
