import React, { useEffect, useState } from "react";
import { BACK_URL } from "../services";
import { Link } from "react-router-dom";
import "./mesBiens.css";

const MesBiens = () => {
    const [annonces, setAnnonces] = useState([]);
    const [showDetails, setShowDetails] = useState(false); 
    const [editId, setEditId] = useState(null); 
    const [editData, setEditData] = useState({}); 

    useEffect(() => {
        fetch('http://localhost:3001/api/biens', { credentials: 'include' }) // include credentials
            .then((response) => response.json())
            .then((data) => {
                setAnnonces(data);
            });

    }, []);

    const handleEdit = (annonce) => {
        setEditId(annonce.id);
        setEditData(annonce);
    };

    const handleInputChange = (event) => {
        setEditData({
            ...editData,
            [event.target.name]: event.target.value,
        });
    };

    const handleModify = () => {

        setEditId(null);
        setEditData({});
    };

    return (
        <div>
            <h1>Mes Biens</h1>
            <hr />
            <div className="bienBailleur">
                {annonces
                    .map((annonce) => (
                        annonce && <div key={annonce.id} className="annonce">
                            <img src={`${BACK_URL}/uploads/${annonce.cheminImg}`} alt={annonce.nomBien} className='mesBiensImg' />
                            {editId === annonce.id ? (
                                <>
                                    <input type="text" name="ville" value={editData.ville} onChange={handleInputChange} />
                                    <input type="text" name="nomBien" value={editData.nomBien} onChange={handleInputChange} />
                                    <input type="text" name="adresse" value={editData.adresse} onChange={handleInputChange} />
                                    <input type="text" name="prix" value={editData.prix} onChange={handleInputChange} />
                                </>
                            ) : (
                                <>
                                    <h2> {annonce.ville}, {annonce.nomBien} </h2>
                                    <h3>{annonce.adresse}</h3>
                                    <p className="assets">Prix par nuits: {annonce.prix}€</p>
                                </>
                            )}
                            <button onClick={() => setShowDetails(!showDetails)}> {/* toggle details visibility */}
                                {showDetails ? 'Hide Details' : 'Show Details'}
                            </button>
                            {showDetails && (
                                <div>
                                    {/* display all the details when showDetails is true */}
                                    {editId === annonce.id ? (
                                        <>
                                            <input type="checkbox" name="id" checked={editData.id} onChange={handleInputChange} />
                                            <input type="checkbox" name="cheminImg" checked={editData.cheminImg} onChange={handleInputChange} />
                                            <input type="checkbox" name="id_ClientBailleur" checked={editData.id_ClientBailleur} onChange={handleInputChange} />
                                            <input type="checkbox" name="description" checked={editData.description} onChange={handleInputChange} />
                                            <input type="checkbox" name="statutValidation" checked={editData.statutValidation} onChange={handleInputChange} />
                                            <input type="checkbox" name="disponible" checked={editData.disponible} onChange={handleInputChange} />
                                            <input type="checkbox" name="typeDePropriete" checked={editData.typeDePropriete} onChange={handleInputChange} />
                                            <input type="checkbox" name="nombreChambres" checked={editData.nombreChambres} onChange={handleInputChange} />
                                            <input type="checkbox" name="nombreLits" checked={editData.nombreLits} onChange={handleInputChange} />
                                            <input type="checkbox" name="nombreSallesDeBain" checked={editData.nombreSallesDeBain} onChange={handleInputChange} />
                                            <input type="checkbox" name="wifi" checked={editData.wifi} onChange={handleInputChange} />
                                            <input type="checkbox" name="cuisine" checked={editData.cuisine} onChange={handleInputChange} />
                                            <input type="checkbox" name="balcon" checked={editData.balcon} onChange={handleInputChange} />
                                            <input type="checkbox" name="jardin" checked={editData.jardin} onChange={handleInputChange} />
                                            <input type="checkbox" name="parking" checked={editData.parking} onChange={handleInputChange} />
                                            <input type="checkbox" name="piscine" checked={editData.piscine} onChange={handleInputChange} />
                                            <input type="checkbox" name="jaccuzzi" checked={editData.jaccuzzi} onChange={handleInputChange} />
                                            <input type="checkbox" name="salleDeSport" checked={editData.salleDeSport} onChange={handleInputChange} />
                                            <input type="checkbox" name="climatisation" checked={editData.climatisation} onChange={handleInputChange} />
                                        </>
                                    ) : (
                                        <>
                                            <p>ID: {annonce.id}</p>
                                            <p>CheminImg: {annonce.cheminImg}</p>
                                            <p>Ville: {annonce.ville}</p>
                                            <p>Adresse: {annonce.adresse}</p>
                                            <p>Id_ClientBailleur: {annonce.id_ClientBailleur}</p>
                                            <p>Prix: {annonce.prix}</p>
                                            <p>NomBien: {annonce.nomBien}</p>
                                            <p>Description: {annonce.description}</p>
                                            <p>StatutValidation: {annonce.statutValidation}</p>
                                            <p>Disponible: {annonce.disponible}</p>
                                            <p>TypeDePropriete: {annonce.typeDePropriete}</p>
                                            <p>NombreChambres: {annonce.nombreChambres}</p>
                                            <p>NombreLits: {annonce.nombreLits}</p>
                                            <p>NombreSallesDeBain: {annonce.nombreSallesDeBain}</p>
                                            <p>Wifi: {annonce.wifi}</p>
                                            <p>Cuisine: {annonce.cuisine}</p>
                                            <p>Balcon: {annonce.balcon}</p>
                                            <p>Jardin: {annonce.jardin}</p>
                                            <p>Parking: {annonce.parking}</p>
                                            <p>Piscine: {annonce.piscine}</p>
                                            <p>Jaccuzzi: {annonce.jaccuzzi}</p>
                                            <p>SalleDeSport: {annonce.salleDeSport}</p>
                                            <p>Climatisation: {annonce.climatisation}</p>
                                        </>
                                    )}
                                </div>
                            )}
                            <button>
                                Supprimer
                            </button>
                            {editId === annonce.id ? (
                                <button onClick={handleModify}>Save</button>
                            ) : (
                                <button onClick={() => handleEdit(annonce)}>Modifier</button>
                            )}
                        </div>
                    ))}
            </div>
            <hr />
        </div>
    );
}

export default MesBiens;