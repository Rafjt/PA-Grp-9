import React, { useEffect, useState, useRef } from "react";
import './prestations.css';
import { getCredentials, fetchPrestationsById, createPrestation, fetchAnnonceByBailleur, deletePrestation, fetchUserById } from "../services";
import { useNavigate } from "react-router-dom";

function Prestations() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [prestations, setPrestations] = useState([]);
    const [biens, setBiens] = useState([]);
    const [prestataires, setPrestataires] = useState([]);
    const navigate = useNavigate();

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    const todayFormatted = yyyy + '-' + mm + '-' + dd;

    const handleDelete = async (id) => {
        await deletePrestation(id);
        window.location.reload();
        // console.log('delete',id);
    };

    const handleContact = () => {
        window.location.replace('/espaceDiscussion');
    };

    useEffect(() => {
        getCredentials().then(data => {
            setUser(data);
            setLoading(false);

            if (data.type === 'prestataires') {
                navigate('/login');
            }
        });

        fetchPrestationsById().then(data => {
            console.log(data);
            setPrestations(data);
        });

        fetchAnnonceByBailleur().then(data => {
            setBiens(data);
        });
    }, []);


    useEffect(() => {
        const fetchPrestataires = async () => {
            const fetchedPrestataires = await Promise.all(prestations.map(async (prestation) => {
                if (prestation.id_Prestataire) {
                    const prestataire = await fetchUserById(prestation.id_Prestataire, 'prestataires');
                    return { ...prestation, prestataire };
                } else {
                    return prestation;
                }
            }));
            setPrestataires(fetchedPrestataires);
        };
        fetchPrestataires();
    }, [prestations]);

    const formRef = useRef();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData);

        await createPrestation(data);

        // Refresh the page
        window.location.reload();
    };

    return (
        <div>
            <div>
                {/* Map over the prestations and display them in a table */}
                <table className="prestaTable">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Nom</th>
                            <th>Description</th>
                            <th>Statut</th>
                            <th>Prix</th>
                            <th>Date</th>
                            <th>Lieu</th>
                            {user && user.type === 'clientsBailleurs' && (
                                <th>Bien associé</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {prestataires.map(prestation => (
                            <tr key={prestation.id}>
                                <td>{prestation.typeIntervention}</td>
                                <td>{prestation.nom}</td>
                                <td>{prestation.description}</td>
                                <td>
                                    {prestation.statut === 'ACCEPTÉE' ?
                                        `${prestation.statut} par ${prestation.prestataire.prenom} ${prestation.prestataire.nom}` :
                                        prestation.statut
                                    }
                                </td>
                                <td>{prestation.prix}</td>
                                <td>
                                    {new Date(prestation.date) < new Date() ?
                                        <span style={{ color: 'red' }}>date limite passée</span> :
                                        prestation.date
                                    }
                                </td>
                                <td>{prestation.ville}, {prestation.lieux}</td>
                                {user && user.type === 'clientsBailleurs' && (
                                    <td>{prestation.nomBien}</td>
                                )}
                                <td>
                                    {new Date(prestation.date) >= new Date() && prestation.statut === 'ACCEPTÉE' ?
                                        <span style={{ cursor: 'pointer', color: 'green' }} onClick={() => handleContact()}>Contacter le prestataire</span> :
                                        new Date(prestation.date) < new Date() ?
                                            <span style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleDelete(prestation.id)}>X</span> :
                                            <span style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleDelete(prestation.id)}>Annuler</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <hr />
            <div className="form-container-presta">
                <div className="formPresta">
                    <h1>Demander un service</h1>
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <label for="typeIntervention">Type de service demandé</label>
                        <select id="typeIntervention" name="typeIntervention" className="form-input">
                            <option value="Conciergerie">Conciergerie</option>
                            <option value="Entretien ménager">Entretien ménager</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Jardinage et entretien extérieur">Jardinage et entretien extérieur</option>
                            <option value="Livraison">Livraison</option>
                            <option value="Gestion des déchets">Gestion des déchets</option>
                            <option value="Soutien administratif">Soutien administratif</option>
                            <option value="Déménagement">Déménagement</option>
                            <option value="Chauffeur">Chauffeur</option>
                            <option value="Sécurité">Sécurité</option>
                        </select>
                        <label for="nom">Intitulé de la demande</label>
                        <input type="text" id="nom" name="nom" className="form-input" />
                        <label for="date">Date</label>
                        <input type="date" id="date" name="date" className="form-input" min={todayFormatted} />
                        <label for="ville">Ville</label>
                        <select id="ville" name="ville" className="form-input">
                            <option value="Paris">Paris</option>
                            <option value="Nice">Nice</option>
                            <option value="Biarritz">Biarritz</option>
                        </select>
                        <label for="lieux">Lieu</label>
                        <input type="text" id="lieux" name="lieux" className="form-input" />
                        {/* Render the additional input if the user type is 'clientsBailleurs' */}
                        {user && user.type === 'clientsBailleurs' && (
                            <>
                                <label for="id_BienImmobilier">Bien associé</label>
                                <select id="id_BienImmobilier" name="id_BienImmobilier" className="form-input">
                                    {biens.map(bien => (
                                        <option value={bien.id}>{bien.nomBien}</option>
                                    ))}
                                </select>
                            </>
                        )}
                        <label for="description">Description</label>
                        <textarea id="description" name="description" className="form-input" />
                        <br />
                        <br />
                        <input type="submit" value="Submit" className="form-submit" />
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Prestations;