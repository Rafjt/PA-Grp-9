import React, { useState, useEffect } from 'react';
import './gestionAnnonce.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';
import { fetchAnnonce, 
    deleteAnnonce, 
    createAnnonce, 
    fetchAnnonceFiltered,
    BACK_URL 
} from '../services';


const GestionAnnonce = () => {
    const [annonces, setAnnonces] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [filterValues, setFilterValues] = useState({
        prixMin: '',
        prixMax: '',
        ville: 'Tout',
        typeDePropriete: 'Tout',
        nombreChambres: 'Tout',
        nombreLits: 'Tout',
        nombreSallesDeBain: 'Tout',
        wifi: false,
        cuisine: false,
        balcon: false,
        jardin: false,
        parking: false,
        piscine: false,
        jaccuzzi: false,
        salleDeSport: false,
        climatisation: false,
    });


    const handleFilterChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFilterValues(prevFilterValues => ({
            ...prevFilterValues,
            [e.target.name]: value,
        }));
    };


    const [form, setForm] = useState({
        description: '',
        nomBien: '',
        statutValidation: '',
        cheminImg: [],
        ville: '',
        adresse: '',
        disponible: '1',
        id: '',
        id_ClientBailleur: '',
        prix: '',
        typeDePropriete: 'Maison',
        nombreChambres: '',
        nombreLits: '',
        nombreSallesDeBain: '',
        wifi: 0,
        cuisine: 0,
        balcon: 0,
        jardin: 0,
        parking: 0,
        piscine: 0,
        jaccuzzi: 0,
        salleDeSport: 0,
        climatisation: 0,
        pictures: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                let data;
                if (isFilterActive()) {
                    data = await fetchAnnonceFiltered(filterValues);
                } else {
                    data = await fetchAnnonce();
                }
                setAnnonces(data);
                console.log('Annonces:', data);
            } catch (error) {
                console.error('Error fetching annonces:', error);
            }
        };

        fetchData();
    }, [filterValues]);
    
    const handleChange = (e) => {
        if (e.target.type === 'file') {
            const files = Array.from(e.target.files); 
            setForm({
                ...form,
                pictures: [...form.pictures, ...files] 
            });
        } else {

            const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
            setForm({
                ...form,
                [e.target.name]: value,
            });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const formData = new FormData();
        for (const key in form) {
          if (key === "pictures") {
            form.pictures.forEach((file, index) => {
              formData.append(`pictures`, file);
            });
          } else {
            formData.append(key, form[key]);
          }
        }
      
        for (let [key, value] of formData.entries()) {
          console.log(`ICIIIIIIII ${key}: ${value}`);
        }
      
        try {
          const response = await createAnnonce(formData);
          setAnnonces([...annonces, response]);
          console.log("Annonce créée:", response);
          window.location.reload();
      
        } catch (error) {
          console.error("Erreur lors de la création de l'annonce:", error);
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

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await fetchAnnonceFiltered(filterValues);
            console.log(filterValues);
        }
        catch (error) {
            console.error('Error applying filters:', error);
        }
    };

    const isFilterActive = () => {
        return Object.values(filterValues).some(value => (
            typeof value === 'boolean' ? value === true : value !== 'Tout'
        ));
    };


    return (
        <div className="gestionAnnonce">
            <h1>Gestion des Annonces</h1>
            <button
            onClick={() => (window.location.href = "/backOffice")}
            className="back-button"
            >
            Retour
            </button>
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
                        <h4>Localisation</h4>
                    <br />
                    <select
                        className="input"
                        name="ville"
                        id="ville"
                        value={form.ville}
                        onChange={handleChange}
                    >
                        <option value="Paris">Paris</option>
                        <option value="Nice">Nice</option>
                        <option value="Biarritz">Biarritz</option>
                    </select>
                    <br />
                    <input className="input" type="text" placeholder="Adresse" name="adresse" value={form.adresse} onChange={handleChange} />
                    <br />
                    <br />
                    <label htmlFor="pictures">Photos du bien :</label>
                    <input
                        type="file"
                        placeholder="photos du bien"
                        name="pictures"
                        accept='image/*'
                        multiple
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
                placeholder="Rechercher (Nom du bien, adresse du bien ou ID)"
                onChange={handleSearch}
                className='input'
                id='searchBar'
            />

            <form onSubmit={handleFilterSubmit}>
                <div className='filters'>
                    <h2>Filtres</h2>
                    <div className='filter-section'>
                        <label>
                            <h5>Type de propriété</h5>
                            <select name="typeDePropriete" id="typeDePropriete" value={filterValues.typeDePropriete} onChange={handleFilterChange}>
                                <option value="Tout">Tout</option>
                                <option value="Maison">Maison</option>
                                <option value="Appartement">Appartement</option>
                                <option value="Maison d'hôtes">Maison d'hôtes</option>
                                <option value="Hôtel">Hôtel</option>
                            </select>
                        </label>
                        <br></br>
                        <label>
                            <h5>Chambres</h5>
                            <select name="nombreChambres" id="nombreChambres" value={filterValues.nombreChambres} onChange={handleFilterChange}>
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
                            <select name="nombreLits" id="nombreLits" value={filterValues.nombreLits} onChange={handleFilterChange}>
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
                            <select name="nombreSallesDeBain" id="nombreSallesDeBain" value={filterValues.nombreSallesDeBain} onChange={handleFilterChange}>
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
                        <br></br>
                        <label>
                            <h5>Prix</h5>
                            <input type='number' name='prixMin' value={filterValues.prixMin} onChange={handleFilterChange} placeholder='Prix min' />
                            <input type='number' name='prixMax' value={filterValues.prixMax} onChange={handleFilterChange} placeholder='Prix max' />
                        </label>
                    </div>
                    <h5>Localisation</h5>
                    <select
                        name="ville"
                        id="ville"
                        value={filterValues.ville}
                        onChange={handleFilterChange}
                    >
                        <option value="Tout">Tout</option>
                        <option value="Paris">Paris</option>
                        <option value="Nice">Nice</option>
                        <option value="Biarritz">Biarritz</option>
                    </select>
                    <br></br>
                    <h4>Équipements</h4>
                    <div className='filter-checkboxes'>
                        <label>
                            <input type="checkbox" name="wifi" className="form-check-input" value={filterValues.wifi} onChange={handleFilterChange} />
                            Wifi
                        </label>
                        <label>
                            <input type="checkbox" name="cuisine" className="form-check-input" value={filterValues.cuisine} onChange={handleFilterChange} />
                            Cuisine
                        </label>
                        <label>
                            <input type="checkbox" name="balcon" className="form-check-input" value={filterValues.balcon} onChange={handleFilterChange} />
                            Balcon
                        </label>
                        <label>
                            <input type="checkbox" name="jardin" className="form-check-input" value={filterValues.jardin} onChange={handleFilterChange} />
                            Jardin
                        </label>
                        <label>
                            <input type="checkbox" name="parking" className="form-check-input" value={filterValues.parking} onChange={handleFilterChange} />
                            Parking
                        </label>
                        <label>
                            <input type="checkbox" name="piscine" className="form-check-input" value={filterValues.piscine} onChange={handleFilterChange} />
                            Piscine
                        </label>
                        <label>
                            <input type="checkbox" name="jaccuzzi" className="form-check-input" value={filterValues.jaccuzzi} onChange={handleFilterChange} />
                            Jaccuzzi
                        </label>
                        <label>
                            <input type="checkbox" name="salleDeSport" className="form-check-input" value={filterValues.salleDeSport} onChange={handleFilterChange} />
                            Salle de sport
                        </label>
                        <label>
                            <input type="checkbox" name="climatisation" className="form-check-input" value={filterValues.climatisation} onChange={handleFilterChange} />
                            Climatisation
                        </label>
                    </div>
                </div>
            </form>

            <div className="annoncesContainer">
                {annonces
                    .filter(
                        (annonce) =>
                            annonce && annonce.nomBien && annonce.nomBien.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            annonce && annonce.id && annonce.id.toString() === searchTerm ||
                            annonce && annonce.propertyName && annonce.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            annonce && annonce.adresse && annonce.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            annonce && annonce.ville && annonce.ville.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((annonce) => (
                        annonce && <div key={annonce.id} className="annonce">
                            <img src={`${BACK_URL}/${annonce.images[0]}`} alt={annonce.nomBien} className='gestionAnnonceImg' />
                            <h2> ID :{annonce.id}, {annonce.nomBien} </h2>
                            <h2> ID du client bailleur propriétaire :{annonce.id_ClientBailleur}</h2>
                            <h3>Prix par nuits: {annonce.prix}€</h3>
                            <h3>{annonce.ville}: {annonce.adresse}</h3>
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
