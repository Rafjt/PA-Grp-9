import React, { useEffect, useState } from "react";
import { BACK_URL, updateAnnonce } from "../services";
import { Link } from "react-router-dom";
import "./mesBiens.css";
import Modal from 'react-modal';

Modal.setAppElement('#root');

const MesBiens = () => {
    const [annonces, setAnnonces] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);

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
        setModalIsOpen(true);
    };

    const handleInputChange = (event) => {
        setEditData({
            ...editData,
            [event.target.name]: event.target.value,
        });
    };

    const handleModify = () => {
        setModalIsOpen(false); // Close the modal when modifications are done
        setEditId(null);
        setEditData({});
        console.log(editData);
        try {
            updateAnnonce(editId, editData);

        } catch (error) {
            console.error(error);
        }
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
                            <h2> {annonce.ville}, {annonce.nomBien} </h2>
                            <h3>{annonce.adresse}</h3>
                            <p className="assets">Prix par nuits: {annonce.prix}€</p>
                            <button onClick={() => setShowDetails(!showDetails)}> {/* toggle details visibility */}
                                {showDetails ? 'Hide Details' : 'Show Details'}
                            </button>
                            {showDetails && (
                                <div className="table-container-mesBiens" style={{ width: '100%', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
                                    <table className="table-mesBiens" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Ville</strong></td>
                                                <td>{annonce.ville}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Adresse</strong></td>
                                                <td>{annonce.adresse}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Prix</strong></td>
                                                <td>{annonce.prix}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Nom du bien</strong></td>
                                                <td>{annonce.nomBien}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Description</strong></td>
                                                <td>{annonce.description}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Statut validation</strong></td>
                                                <td>{annonce.statutValidation}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Disponible</strong></td>
                                                <td>{annonce.disponible}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Type de propriete</strong></td>
                                                <td>{annonce.typeDePropriete}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Nombre de chambres</strong></td>
                                                <td>{annonce.nombreChambres}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Nombre de lits</strong></td>
                                                <td>{annonce.nombreLits}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Nombre de salles de bain</strong></td>
                                                <td>{annonce.nombreSallesDeBain}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Wifi</strong></td>
                                                <td>{annonce.wifi == 1 ? 'Oui' : 'Non'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Cuisine</strong></td>
                                                <td>{annonce.cuisine == 1 ? 'Oui' : 'Non'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Balcon</strong></td>
                                                <td>{annonce.balcon == 1 ? 'Oui' : 'Non'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Jardin</strong></td>
                                                <td>{annonce.jardin == 1 ? 'Oui' : 'Non'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Parking</strong></td>
                                                <td>{annonce.parking == 1 ? 'Oui' : 'Non'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Piscine</strong></td>
                                                <td>{annonce.piscine == 1 ? 'Oui' : 'Non'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Jaccuzzi</strong></td>
                                                <td>{annonce.jaccuzzi == 1 ? 'Oui' : 'Non'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Salle de sport</strong></td>
                                                <td>{annonce.salleDeSport == 1 ? 'Oui' : 'Non'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                                <td><strong>Climatisation</strong></td>
                                                <td>{annonce.climatisation == 1 ? 'Oui' : 'Non'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <button>
                                Supprimer
                            </button>
                            <button onClick={() => handleEdit(annonce)}>Modifier</button>
                        </div>
                    ))}
            </div>
            <hr />
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)} // This allows the modal to be closed when clicking outside of it
            >
                <h2 className="mb-3">Modifier l'annonce</h2>
                <form>
                <div className="mb-3">
                <label htmlFor="cheminImg">Modifier l'image :</label>
                    <input type="file" name="cheminImg" onChange={handleInputChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Ville</label>
                        <select className="form-select mesBiensModal" name="ville" value={editData.ville} onChange={handleInputChange}>
                            <option value="Paris">Paris</option>
                            <option value="Nice">Nice</option>
                            <option value="Biarritz">Biarritz</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Nom du bien</label>
                        <input type="text" name="nomBien" value={editData.nomBien} onChange={handleInputChange} className="form-control mesBiensModal" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Adresse</label>
                        <input type="text" name="adresse" value={editData.adresse} onChange={handleInputChange} className="form-control mesBiensModal" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Prix</label>
                        <input type="number" name="prix" value={editData.prix} onChange={handleInputChange} className="form-control mesBiensModal" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea name="description" value={editData.description} onChange={handleInputChange} className="form-control mesBiensModal"></textarea>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Type de propriété</label>
                        <select className="form-select mesBiensModal">
                            <option value="Maison">Maison</option>
                            <option value="Appartement">Appartement</option>
                            <option value="Maison d'hôtes">Maison d'hôtes</option>
                            <option value="Hôtel">Hôtel</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Nombre de chambres</label>
                        <input type="number" name="nombreChambres" value={editData.nombreChambres} onChange={handleInputChange} className="form-control mesBiensModal" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Nombre de lits</label>
                        <input type="number" name="nombreLits" value={editData.nombreLits} onChange={handleInputChange} className="form-control mesBiensModal" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Nombre de salles de bain</label>
                        <input type="number" name="nombreSallesDeBain" value={editData.nombreSallesDeBain} onChange={handleInputChange} className="form-control mesBiensModal" />
                    </div>
                    <div>
                        <label className="form-label">Wifi</label>
                        <select className="form-select mesBiensModal" name="wifi" value={editData.wifi} onChange={handleInputChange}>
                            <option value="1">Oui</option>
                            <option value="0">Non</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Cuisine</label>
                        <select className="form-select mesBiensModal" name="cuisine" value={editData.cuisine} onChange={handleInputChange}>
                            <option value="1">Oui</option>
                            <option value="0">Non</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Balcon</label>
                        <select className="form-select mesBiensModal" name="balcon" value={editData.balcon} onChange={handleInputChange}>
                            <option value="1">Oui</option>
                            <option value="0">Non</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Jardin</label>
                        <select className="form-select mesBiensModal" name="jardin" value={editData.jardin} onChange={handleInputChange}>
                            <option value="1">Oui</option>
                            <option value="0">Non</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Parking</label>
                        <select className="form-select mesBiensModal" name="parking" value={editData.parking} onChange={handleInputChange}>
                            <option value="1">Oui</option>
                            <option value="0">Non</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Jaccuzzi</label>
                        <select className="form-select mesBiensModal" name="jaccuzzi" value={editData.jaccuzzi} onChange={handleInputChange}>
                            <option value="1">Oui</option>
                            <option value="0">Non</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Salle de sport</label>
                        <select className="form-select mesBiensModal" name="salleDeSport" value={editData.salleDeSport} onChange={handleInputChange}>
                            <option value="1">Oui</option>
                            <option value="0">Non</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Climatisation</label>
                        <select className="form-select mesBiensModal" name="climatisation" value={editData.climatisation} onChange={handleInputChange}>
                            <option value="1">Oui</option>
                            <option value="0">Non</option>
                        </select>
                    </div>
                    <button onClick={handleModify} className="btn btn-primary">Save</button>
                </form>
            </Modal>
        </div>
    );
}

export default MesBiens;