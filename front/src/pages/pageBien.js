import React, { useEffect } from "react";
import { fetchAnnonce, fetchUsers } from "../services";
import './pageBien.css';
import { BACK_URL } from "../services";

const PageBien = () => {

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

    return (
        <div>
            <h1>Page Bien</h1>
            <div className="filtres">
                <form className="searchbar">
                    <input type="text" placeholder="Ville" />
                    <input type="date" placeholder="arrivée"/>
                    <input type="date" placeholder="départ"/>
                </form>
            </div>
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
