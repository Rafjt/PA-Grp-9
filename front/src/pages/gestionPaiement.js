import React, { useEffect, useState } from "react";
import {
  fetchPaiement,
  deletePaiement,
  validatePaiement,
  createPaiement,
  updatePaiement,
} from "../services";
const GestionPaiement = () => {
  const [paiements, setPaiements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    idReservation: "",
    nom: "",
    datePaiement: "",
    methodePaiement: "",
    montant: "",
    statut: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPaiement = await createPaiement(form);
    fetchPaiement().then((data) => {
      setPaiements(data);
      setForm({
        idReservation: "",
        nom: "",
        datePaiement: "",
        methodePaiement: "",
        montant: "",
        statut: "",
      });
    });
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
  };

  const handleValidate = async (id) => {
    console.log(id);
    await validatePaiement(id);
    const updatedPaiements = await fetchPaiement();
    setPaiements(updatedPaiements);
  };

  const filteredPaiements = paiements.filter(
    (paiement) =>
      (paiement.nom &&
        paiement.nom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (paiement.id_Reservation &&
        String(paiement.id_Reservation).includes(searchQuery)) ||
      (paiement.id && String(paiement.id).includes(searchQuery))
  );

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  const handleEdit = (paiement) => {
    setEditingId(paiement.id);
    setEditingData(paiement);
  };

  const handleAccept = async () => {
    await updatePaiement(editingId, editingData);
    const updatedPaiements = await fetchPaiement();
    setPaiements(updatedPaiements);
    setEditingId(null);
  };

  const handleEditingChange = (e) => {
    setEditingData({
      ...editingData,
      [e.target.name]: e.target.value,
    });
  };

  const tableContainerStyle = {
    maxHeight: "600px",
    overflowY: "auto",
  };

  return (
    <div>
      <h1>Gestion des paiements</h1>
      <button
        onClick={() => (window.location.href = "/backOffice")}
        className="back-button"
      >
        Retour
      </button>
      <div className="creation rounded shadow">
        <h2>Créer un paiement</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            id="idReservation"
            name="idReservation"
            value={form.idReservation}
            onChange={handleChange}
            placeholder="ID de réservation associé"
          />
          <br />
          <input
            className="input"
            type="text"
            id="nom"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            placeholder="Titre de la reservation"
          />
          <br />
          <input
            className="input"
            type="date"
            id="datePaiement"
            name="datePaiement"
            value={form.datePaiement}
            onChange={handleChange}
            placeholder="Date de paiement"
          />
          <br />
          <input
            className="input"
            type="text"
            id="methodePaiement"
            name="methodePaiement"
            value={form.methodePaiement}
            onChange={handleChange}
            placeholder="Méthode de paiement"
          />
          <br />
          <input
            className="input"
            type="number"
            id="montant"
            name="montant"
            value={form.montant}
            onChange={handleChange}
            placeholder="Montant"
          />
          <br />
          <select
            className="input"
            id="statut"
            name="statut"
            value={form.statut}
            onChange={handleChange}
          >
            <option value="">-- Statut--</option>
            <option value="En attente">En attente</option>
            <option value="Validé">validé</option>
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
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="usersContainer rounded shadow mt-3">
        <div className="table-container" style={tableContainerStyle}>
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
                  {editingId === paiement.id ? (
                    <>
                      <td>{paiement.id}</td>
                      <td>
                        <input
                          type="number"
                          name="id_Reservation"
                          value={editingData.id_Reservation}
                          onChange={handleEditingChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="nom"
                          value={editingData.nom}
                          onChange={handleEditingChange}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          name="datePaiement"
                          value={editingData.datePaiement}
                          onChange={handleEditingChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="methodePaiement"
                          value={editingData.methodePaiement}
                          onChange={handleEditingChange}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="montant"
                          value={editingData.montant}
                          onChange={handleEditingChange}
                        />
                      </td>
                      <select
                        id="statut"
                        name="statut"
                        value={editingData.statut}
                        onChange={handleEditingChange}
                      >
                        <option value="En attente">En attente</option>
                        <option value="Validé">Validé</option>
                      </select>
                      <td>
                        <div className="button-container">
                          <button onClick={handleAccept}>Accepter</button>
                          <button onClick={() => handleDelete(paiement.id)}>
                            Supprimer
                          </button>
                          {paiement.statut !== "Validé" ? (
                            <button onClick={() => handleValidate(paiement.id)}>
                              Valider
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{paiement.id}</td>
                      <td>{paiement.id_Reservation}</td>
                      <td>{paiement.nom}</td>
                      <td>{paiement.datePaiement}</td>
                      <td>{paiement.methodePaiement}</td>
                      <td>{paiement.montant} €</td>
                      <td>{paiement.statut}</td>
                      <td>
                        <button onClick={() => handleEdit(paiement)}>
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(paiement.id)}>
                          Supprimer
                        </button>
                        {paiement.statut !== "Validé" ? (
                          <button onClick={() => handleValidate(paiement.id)}>
                            Valider
                          </button>
                        ) : null}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionPaiement;
