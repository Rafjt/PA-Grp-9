import React, { useState, useEffect } from 'react';
import './gestionAnnonce.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';
import { fetchAnnonce, deleteAnnonce, createAnnonce } from '../services';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';


const GestionAnnonce = () => {
    const [annonces, setAnnonces] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState({
        description: '',
        nomBien: '',
        statutValidation: '',
        cheminImg: '',
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchAnnonce();
                setAnnonces(data);
            } catch (error) {
                console.error('Error fetching annonces:', error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
        setForm({
            ...form,
            [e.target.name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await createAnnonce({
                ...form,
            });
            setAnnonces([...annonces, data]);
            console.log('Annonce created:', data);
            console.log(data);
        } catch (error) {
            console.error('Error creating annonce:', error);
        }
    };

    const handleDelete = (annonceId) => {
        console.log(annonceId);
        deleteAnnonce(annonceId)
            .then(() => {
                setAnnonces((prevAnnonces) => prevAnnonces.filter(
                    (annonce) => annonce.id !== annonceId
                ));
            })
            .catch((error) => console.error('Error deleting annonce:', error));
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    if (!annonces) {
        return <div>Loading...</div>;
    }

    return (
        <div className="gestionAnnonce">
            <h1>Gestion des Annonces</h1>
            <form onSubmit={handleSubmit}>
                <div className="createAnnonce">
                    <h2>Ajouter une annonce</h2>
                    <input
                        className="input"
                        type="text"
                        placeholder="Nom du bien"
                        name="nomBien"
                        value={form.nomBien}
                        onChange={handleChange}
                    />
                    <input
                        className="input"
                        type='text'
                        placeholder='description'
                        name='description'
                        value={form.description}
                        onChange={handleChange}
                    />
                    <input
                        className="input"
                        type="number"
                        placeholder="ID du client bailleur"
                        name="id_ClientBailleur"
                        value={form.id_ClientBailleur}
                        onChange={handleChange}
                    />
                    <input
                        className="input"
                        type="number"
                        placeholder="Prix"
                        name="prix"
                        value={form.prix}
                        onChange={handleChange}
                    />
                    <br />
                    <br />
                    <label htmlFor="pictures">Photos du bien :</label>
                    <input
                        type="file"
                        placeholder="photos du bien"
                        name="pictures"
                        onChange={handleChange}
                    />
                    <br />
                    <br />
                    <label htmlFor="disponible">Disponible :</label>
                    <select
                        name="disponible"
                        id="disponible"
                        value={form.disponible}
                        onChange={handleChange}
                    >
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                    <br />
                    <div className='typeDePropriete'>
                        <h5>Type de propriété</h5>
                        <select className='input' name="typeDePropriete" id="typeDePropriete" value={form.typeDePropriete} onChange={handleChange}>
                            <option value="Maison">Maison</option>
                            <option value="Appartement">Appartement</option>
                            <option value="Maison d'hôtes">Maison d'hôtes</option>
                            <option value="Hôtel">Hôtel</option>
                        </select>

                        <h5>Chambres</h5>
                        <input className='input' type="number" name="nombreChambres" value={form.nombreChambres} onChange={handleChange} />

                        <h5>Lits</h5>
                        <input className='input' type="number" name="nombreLits" value={form.nombreLits} onChange={handleChange} />

                        <h5>Salles de bain</h5>
                        <input className='input' type="number" name="nombreSallesDeBain" value={form.nombreSallesDeBain} onChange={handleChange} />

                    </div>
                    <div className='equipments'>
                        <h5>Équipements</h5>
                        <label>
                            <input type="checkbox" name="wifi" className="form-check-input" checked={form.wifi} onChange={handleChange} />
                            Wifi
                        </label>
                        <label>
                            <input type="checkbox" name="cuisine" className="form-check-input" checked={form.cuisine} onChange={handleChange} />
                            Cuisine
                        </label>
                        <label>
                            <input type="checkbox" name="balcon" className="form-check-input" checked={form.balcon} onChange={handleChange} />
                            Balcon
                        </label>
                        <label>
                            <input type="checkbox" name="jardin" className="form-check-input" checked={form.jardin} onChange={handleChange} />
                            Jardin
                        </label>
                        <label>
                            <input type="checkbox" name="parking" className="form-check-input" checked={form.parking} onChange={handleChange} />
                            Parking
                        </label>
                        <label>
                            <input type="checkbox" name="piscine" className="form-check-input" checked={form.piscine} onChange={handleChange} />
                            Piscine
                        </label>
                        <label>
                            <input type="checkbox" name="jaccuzzi" className="form-check-input" checked={form.jaccuzzi} onChange={handleChange} />
                            Jaccuzzi
                        </label>
                        <label>
                            <input type="checkbox" name="salleDeSport" className="form-check-input" checked={form.salleDeSport} onChange={handleChange} />
                            Salle de sport
                        </label>
                        <label>
                            <input type="checkbox" name="climatisation" className="form-check-input" checked={form.climatisation} onChange={handleChange} />
                            Climatisation
                        </label>
                    </div>


                    <br />
                    <input
                        className="input"
                        type="submit"
                        value="Créer"
                        method="POST"
                    ></input>
                </div>
            </form>

            <hr></hr>

            <h2>Rechercher un bien</h2>
            <input
                type="text"
                placeholder="Rechercher (Nom du bien ou ID)"
                onChange={handleSearch}
                className='input'
                id='searchBar'
            />

            <div className='filters'>
                <h2>Filtres</h2>
                <div className='filter-section'>
                    <label>
                        <h5>Type de propriété</h5>
                        <select name="typeDePropriete" id="typeDePropriete">
                            <option value="Maison">Maison</option>
                            <option value="Appartement">Appartement</option>
                            <option value="Maison d'hôtes">Maison d'hôtes</option>
                            <option value="Hôtel">Hôtel</option>
                        </select>
                    </label>
                    <br></br>
                    <label>
                        <h5>Chambres</h5>
                        <select name="chambres" id="chambres">
                            <option value="Tout">Tout</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8+">8+</option>
                        </select>
                    </label>

                    <label>
                        <h5>Lits</h5>
                        <select name="lits" id="lits">
                            <option value="Tout">Tout</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8+">8+</option>
                        </select>
                    </label>
                    <label>
                        <h5>Salles de bain</h5>
                        <select name="sallesDeBain" id="sallesDeBain">
                            <option value="Tout">Tout</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8+">8+</option>
                        </select>
                    </label>
                </div>
                <br></br>
                <div className='filter-section'>
                    <h5>Équipements</h5>
                    <label>
                        <input type="checkbox" name="wifi" className="form-check-input" />
                        Wifi
                    </label>
                    <label>
                        <input type="checkbox" name="cuisine" className="form-check-input" />
                        Cuisine
                    </label>
                    <label>
                        <input type="checkbox" name="balcon" className="form-check-input" />
                        Balcon
                    </label>
                    <label>
                        <input type="checkbox" name="jardin" className="form-check-input" />
                        Jardin
                    </label>
                    <label>
                        <input type="checkbox" name="parking" className="form-check-input" />
                        Parking
                    </label>
                    <label>
                        <input type="checkbox" name="piscine" className="form-check-input" />
                        Piscine
                    </label>
                    <label>
                        <input type="checkbox" name="jaccuzzi" className="form-check-input" />
                        Jaccuzzi
                    </label>
                    <label>
                        <input type="checkbox" name="salleDeSport" className="form-check-input" />
                        Salle de sport
                    </label>
                    <label>
                        <input type="checkbox" name="climatisation" className="form-check-input" />
                        Climatisation
                    </label>
                </div>
            </div>

            <div className="annoncesContainer">
                {annonces
                    .filter(
                        (annonce) =>
                            annonce && annonce.nomBien && annonce.nomBien.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            annonce && annonce.id && annonce.id.toString() === searchTerm
                    )
                    .map((annonce) => (
                        annonce && <div key={annonce.id} className="annonce">
                            <img src={`/img/bien${annonce.id}.jpeg`} alt={annonce.nomBien} className='img' />
                            <h2> ID :{annonce.id}</h2>
                            <h2> ID du client bailleur propriétaire :{annonce.id_ClientBailleur}</h2>
                            <h2>{annonce.nomBien}</h2>
                            <h3>Prix par nuits: {annonce.prix}€</h3>
                            <button onClick={() => handleDelete(annonce.id)}>
                                Supprimer
                            </button>
                            <Link to={{
                                pathname: `/update/${annonce.id}/bien`,
                                state: { annonce },
                            }}>
                                Modifier
                            </Link>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default GestionAnnonce;
