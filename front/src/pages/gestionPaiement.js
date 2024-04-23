import React, { useEffect, useState } from "react";
import { fetchPaiement,deletePaiement,validatePaiement,createPaiement } from "../services";

const GestionPaiement = () => {
    const [paiements, setPaiements] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [form, setForm] = useState({
        idReservation: "",
        nom: "",
        datePaiement: "",
        methodePaiement: "",
        montant: "",
        statut: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(form);
        await createPaiement(form);
    };

    useEffect(() => {
        fetchPaiement().then((data) => {
            setPaiements(data);
        });
    }, []);

    const handleDelete = async (id) => {
        console.log(id);
        await deletePaiement(id);
        const updatedPaiements = await fetchPaiement();
        setPaiements(updatedPaiements);
    }

    const handleValidate = async (id) => {
        console.log(id);
        await validatePaiement(id);
        const updatedPaiements = await fetchPaiement();
        setPaiements(updatedPaiements);
    }

    const filteredPaiements = paiements.filter(paiement =>
        paiement.nom && paiement.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paiement.id_Reservation && String(paiement.id_Reservation).includes(searchQuery) ||
        paiement.id && String(paiement.id).includes(searchQuery)
    );

    return (
                <div>
                    <h1>Gestion des paiements</h1>
                    <div className="creation rounded shadow">
                        <h2>Créer un paiement</h2>
                        <form onSubmit={handleSubmit}>
                            <input className='input' type="text" id="idReservation" name="idReservation" value={form.idReservation} onChange={handleChange} placeholder="ID de réservation associé" />
                            <br />
                            <input className='input' type="text" id="nom" name="nom" value={form.nom} onChange={handleChange} placeholder="Titre de la reservation" />
                            <br />
                            <input className='input' type="date" id="datePaiement" name="datePaiement" value={form.datePaiement} onChange={handleChange} placeholder="Date de paiement" />
                            <br />
                            <input className='input' type="text" id="methodePaiement" name="methodePaiement" value={form.methodePaiement} onChange={handleChange} placeholder="Méthode de paiement" />
                            <br />
                            <input className='input' type="number" id="montant" name="montant" value={form.montant} onChange={handleChange} placeholder="Montant" />
                            <br />
                            <select className='input' id="statut" name="statut" value={form.statut} onChange={handleChange}>
                                <option value="">-- Statut--</option>
                                <option value="En attente">En attente</option>
                                <option value="Valider">Valider</option>
                            </select>
                            <br />
                            <button type="submit">Créer un paiement</button>
                        </form>
                    </div>
                    <div className="search-bar mt-3">
                        <input
                            className="input mt-3"
                            type="text"
                            placeholder="Rechercher un paiement(id, nom, id de réservation)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="usersContainer rounded shadow mt-3">
                        <table className="table table-bordered table-hover custom-table">
                            <thead>
                                <tr>
                                    <th className="narrow-column">ID</th>
                                    <th>ID de réservation</th>
                                    <th>Nom</th>
                                    <th>Date de paiement(AAAA-MM-JJ)</th>
                                    <th>Méthode de paiement</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPaiements.map((paiement) => (
                                    <tr key={paiement.id}>
                                        <td className="narrow-column">{paiement.id}</td>
                                        <td>{paiement.id_Reservation}</td>
                                        <td>{paiement.nom}</td>
                                        <td>{paiement.datePaiement}</td>
                                        <td>{paiement.methodePaiement}</td>
                                        <td>{paiement.montant}</td>
                                        <td>{paiement.statut}</td>
                                        <td className="long-column">
                                            <button className="ml-1">Modifier</button>
                                            <button onClick={() => handleDelete(paiement.id)} className=" ml-1">Supprimer</button>
                                            {paiement.statut !== 'Valider' ? <button onClick={() => handleValidate(paiement.id)} className="ml-1">Valider</button> : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        export default GestionPaiement;
