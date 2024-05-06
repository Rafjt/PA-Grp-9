import React, { useEffect } from "react";
import { createAnnonce } from "../services";

function CreeBien() {

    const [data, setData] = React.useState({});
    const [annonces, setAnnonces] = React.useState([]);

    const [form, setForm] = React.useState({
        id_ClientBailleur: null,
        nomBien: "",
        description: "",
        prix: "",
        ville: "Paris",
        adresse: "",
        pictures: "",
        disponible: "1",
        typeDePropriete: "Maison",
        nombreChambres: "",
        nombreLits: "",
        nombreSallesDeBain: "",
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
        fetch('http://localhost:3001/auth/me', { credentials: 'include' })
            .then((response) => response.json())
            .then((data) => {
                setData(data);
                // Update id_ClientBailleur after data has been fetched
                setForm(prevForm => ({ ...prevForm, id_ClientBailleur: data.id }));
            });
    }, []);

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            // If the input is a file input, handle the file upload
            const file = e.target.files[0]; // Get the first file from the input
            setForm({
                ...form,
                pictures: file // Set the file object in the state
            });
        } else {
            // For other inputs, handle as usual
            const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
            setForm({
                ...form,
                [e.target.name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('form:', form);
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

    
    return (
        <div>
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
        </div>
    );
}

export default CreeBien;