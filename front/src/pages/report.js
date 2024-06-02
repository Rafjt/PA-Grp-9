import React from "react";
import "./report.css";
import { createSignalements, getCredentials } from "../services";
import { useEffect, useState } from "react";

const Report = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCredentials().then(data => {
            setUser(data);
            console.log(data);
            setLoading(false);
        });
    }, [])

    const handleBackButtonClick = () => {
        switch (user.type) {
            case 'clientsBailleurs':
                window.location.href = "/espaceBailleur";
                break;
            case 'voyageurs':
                window.location.href = "/espaceVoyageur";
                break;
            case 'prestataires':
                window.location.href = "/espacePrestataire";
                break;
            default:
                console.error('Invalid user type');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submit");
        const sujet = document.getElementById('sujet').value;
        await createSignalements(sujet);
    }

    return (
        <div>
            <button
                onClick={handleBackButtonClick}
                className="back-button"
            >
                Retour
            </button>
            <h1>Signaler un problème</h1>
            <p1>Ici vous pouvez signaler un problème, bug ou autres que vous avées rencontrées sur la platforme</p1>
            <hr></hr>
            <form onSubmit={handleSubmit}>
                <h1>Sujet</h1>
                <textarea id="sujet" name="sujet" placeholder="Veuillez décrire votre problème..." className="form-input form-Sujet"></textarea>
                <br></br>
                <input type="submit" value="Envoyer" className="btn btn-dark"></input>
            </form>
        </div>
    );
}

export default Report;