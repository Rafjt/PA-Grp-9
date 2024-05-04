import React, { useEffect, useState } from 'react';
import { updateAnnonce } from '../services';
import { useNavigate } from 'react-router-dom';

const ModifyBien = () => {
    const [annonce, setAnnonce] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const id = sessionStorage.getItem('elementId');

        // Fetch the data for this id from your API
        fetch(`http://localhost:3001/api/bienImo/${id}`, { credentials: 'include' })
            .then(response => response.json())
            .then(data => setAnnonce(data));
    }, []);

    const handleChange = (event) => {
        setAnnonce({ ...annonce, [event.target.name]: event.target.value });
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await updateAnnonce(annonce.id, annonce, selectedFile);
        navigate('/mesBiens');
    };


    return (
        <div>
            <h1>Modifier le bien</h1>
            <hr />
            <form onSubmit={handleSubmit}>
                {annonce && (
                    <div className='containerViewBien'>
                        <h1>
                            <input type="text" name="nomBien" value={annonce.nomBien} onChange={handleChange} />
                        </h1>
                        <img src={selectedFile ? URL.createObjectURL(selectedFile) : `http://localhost:3001/uploads/${annonce.cheminImg}`} alt={annonce.nomBien} />
                        <input type="file" onChange={handleFileChange} />
                        <h2>
                            <input type="text" name="typeDePropriete" value={annonce.typeDePropriete} onChange={handleChange} />
                        </h2>
                        <h3>
                            <input type="text" name="ville" value={annonce.ville} onChange={handleChange} />
                        </h3>
                        <h3>
                            <input type="text" name="adresse" value={annonce.adresse} onChange={handleChange} />
                        </h3>
                        <p>
                            <input type="number" name="nombreChambres" value={annonce.nombreChambres} onChange={handleChange} /> Chambres
                        </p>
                        <p>
                            <input type="number" name="nombreLits" value={annonce.nombreLits} onChange={handleChange} /> Lits
                        </p>
                        <p>
                            <input type="number" name="nombreSallesDeBain" value={annonce.nombreSallesDeBain} onChange={handleChange} /> Salles de bain
                        </p>
                        <hr />
                        <p>
                            <strong>
                                <input type="number" name="prix" value={annonce.prix} onChange={handleChange} />€
                            </strong> par nuits
                        </p>
                        <p>
                            <textarea name="description" value={annonce.description} onChange={handleChange} />
                        </p>
                        <hr />
                        <p>Equipements:</p>
                        <table className="equipment-table">
                            <tr>
                                <th>wifi</th>
                                <td><input type="checkbox" checked={annonce.wifi == 1} onChange={() => setAnnonce({ ...annonce, wifi: annonce.wifi == 1 ? 0 : 1 })} /></td>
                            </tr>
                            <tr>
                                <th>Cuisine</th>
                                <td><input type="checkbox" checked={annonce.cuisine == 1} onChange={() => setAnnonce({ ...annonce, cuisine: annonce.cuisine == 1 ? 0 : 1 })} /></td>
                            </tr>
                            <tr>
                                <th>Balcon</th>
                                <td><input type="checkbox" checked={annonce.balcon == 1} onChange={() => setAnnonce({ ...annonce, balcon: annonce.balcon == 1 ? 0 : 1 })} /></td>
                            </tr>
                            <tr>
                                <th>Jardin</th>
                                <td><input type="checkbox" checked={annonce.jardin == 1} onChange={() => setAnnonce({ ...annonce, jardin: annonce.jardin == 1 ? 0 : 1 })} /></td>
                            </tr>
                            <tr>
                                <th>Parking</th>
                                <td><input type="checkbox" checked={annonce.parking == 1} onChange={() => setAnnonce({ ...annonce, parking: annonce.parking == 1 ? 0 : 1 })} /></td>
                            </tr>
                            <tr>
                                <th>Piscine</th>
                                <td><input type="checkbox" checked={annonce.piscine == 1} onChange={() => setAnnonce({ ...annonce, piscine: annonce.piscine == 1 ? 0 : 1 })} /></td>
                            </tr>
                            <tr>
                                <th>Jaccuzzi</th>
                                <td><input type="checkbox" checked={annonce.jaccuzzi == 1} onChange={() => setAnnonce({ ...annonce, jaccuzzi: annonce.jaccuzzi == 1 ? 0 : 1 })} /></td>
                            </tr>
                            <tr>
                                <th>Salle de sport</th>
                                <td><input type="checkbox" checked={annonce.salleDeSport == 1} onChange={() => setAnnonce({ ...annonce, salleDeSport: annonce.salleDeSport == 1 ? 0 : 1 })} /></td>
                            </tr>
                            <tr>
                                <th>Climatisation</th>
                                <td><input type="checkbox" checked={annonce.climatisation == 1} onChange={() => setAnnonce({ ...annonce, climatisation: annonce.climatisation == 1 ? 0 : 1 })} /></td>
                            </tr>
                        </table>
                        <hr />
                        <button type='submit' className="btn btn-dark">Valider les modifications</button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default ModifyBien;