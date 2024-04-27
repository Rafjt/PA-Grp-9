import React, { useEffect } from "react";
import { fetchAnnonce, fetchUsers } from "../services";
import './pageBien.css';
import { BACK_URL } from "../services";

const PageBien = () => {

    const [arriveeDate, setArriveeDate] = React.useState(new Date().toISOString().split('T')[0]);

    // const handleArriveeChange = (event) => {
    //     setArriveeDate(event.target.value);
    // };

    const [bailleur, setBailleur] = React.useState([]);
    useEffect(() => {
        fetchUsers().then((response) => {
            setBailleur(response.clientsBailleurs);
            console.log(response.clientsBailleurs);
        });
    }, []); 

    const [data, setData] = React.useState([]);
    useEffect(() => {
        fetchAnnonce().then((data) => {
            setData(data);
        });
    }, []);

    const handleClick = (e) => {
        console.log(e.target);
        console.log("here");
    };

    const [filtres, setFiltres] = React.useState({
        ville: '',
        arrivee: new Date().toISOString().split('T')[0],
        depart: new Date().toISOString().split('T')[0]
    });

    const handleInputChange = (event) => {
        setFiltres({
            ...filtres,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(filtres);
    }

    return (
        <div>
            <h1>Page Bien</h1> 
            <div className="filtres">
                <form className="searchbar" onSubmit={handleSubmit}>
                    <select name="ville" value={filtres.ville} onChange={handleInputChange}>
                        <option value="">-- Ville --</option>
                        <option value="Paris">Paris</option>
                        <option value="Nice">Nice</option>
                        <option value="Biarritz">Biarritz</option>
                    </select>
                    <input type="date" name="arrivee" placeholder="arrivée" min={new Date().toISOString().split('T')[0]} value={filtres.arrivee} onChange={handleInputChange}/>
                    <input type="date" name="depart" placeholder="départ" min={filtres.arrivee} value={filtres.depart} onChange={handleInputChange}/>
                    <button type="submit">Rechercher</button>
                </form>
            </div>
            <hr />
            <div className="grid-container" onClick={handleClick}>
                {data.map((annonce) => {
                    const bailleurForThisAnnonce = bailleur.find(b => b.id === annonce.id_ClientBailleur);
                    return (
                        <div key={annonce.id}>
                            <img src={`${BACK_URL}/uploads/${annonce.cheminImg}`} alt={annonce.nomBien} className='img' />
                            <h2>{annonce.ville}, {annonce.nomBien}</h2>
                            <p className="grey">Proposé par {bailleurForThisAnnonce ? bailleurForThisAnnonce.prenom + ' ' + bailleurForThisAnnonce.nom : 'Unknown'}</p>
                            <p><strong>{annonce.prix}€</strong> par nuits</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
            }
export default PageBien;
