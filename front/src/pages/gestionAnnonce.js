import React, { useState, useEffect } from 'react';
import './gestionAnnonce.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';
import { fetchAnnonce, deleteAnnonce, createAnnonce } from '../services';


const GestionAnnonce = () => {
    const [annonces, setAnnonces] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [bien, setBien] = useState({
        nomBien: '',
        description: '',
        idClientBailleur: '',
        prix: '',
        disponible: '',
    });

    const [form, setForm] = useState({
        description: '',
        nomBien: '',
        statutValidation: '',
        cheminImg: '',
        disponible: '',
        id: '',
        idClientBailleur: '',
        prix: '',
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
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await createAnnonce({
                ...form,
                ...bien
            });
            setAnnonces([...annonces, data]);
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
                        name="idClientBailleur"
                        value={form.idClientBailleur}
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
                    <input
                        className="input"
                        type="submit"
                        value="Créer"
                        method="POST"
                    ></input>
                </div>
            </form>
            <h2>Rechercher un bien</h2>
            <input
                type="text"
                placeholder="Rechercher (Nom du bien ou ID)"
                onChange={handleSearch}
                className='input'
                id='searchBar'
            />
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
                            <h2> ID du client bailleur propriétaire :{annonce.idClientBailleur}</h2>
                            <h2>{annonce.nomBien}</h2>
                            <h3>Prix par nuits {annonce.prix}€</h3>
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
