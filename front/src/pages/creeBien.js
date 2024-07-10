import React, { useEffect, useState } from "react";
import { createAnnonce, getCredentials } from "../services";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function CreeBien() {
  const [data, setData] = useState({});
  const [annonces, setAnnonces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    id_ClientBailleur: null,
    nomBien: "",
    description: "",
    prix: "",
    ville: "Paris",
    adresse: "",
    pictures: [],
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
    climatisation: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    getCredentials()
      .then((data) => {
        setData(data);
        setForm((prevForm) => ({ ...prevForm, id_ClientBailleur: data.id }));
      })
      .catch((error) => console.log(error));
  }, []);

  const handleChange = (e) => {
    if (e.target.type === "file") {
      const files = Array.from(e.target.files);
      setForm({
        ...form,
        pictures: files, 
      });
      console.log('File changed:', files); 
    } else {
      const value = e.target.type === "checkbox" ? (e.target.checked ? 1 : 0) : e.target.value;
      setForm({
        ...form,
        [e.target.name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nomBien.trim()) {
      setModalMessage("Veuillez entrer le nom de la propriété.");
      setShowModal(true);
      return;
    }

    if (!form.description.trim()) {
      setModalMessage("Veuillez entrer une description.");
      setShowModal(true);
      return;
    }

    if (!form.prix || isNaN(form.prix) || form.prix <= 0) {
      setModalMessage("Veuillez entrer un prix valide.");
      setShowModal(true);
      return;
    }

    if (!form.adresse.trim()) {
      setModalMessage("Veuillez entrer une adresse.");
      setShowModal(true);
      return;
    }

    if (!form.nombreChambres || isNaN(form.nombreChambres) || form.nombreChambres <= 0) {
      setModalMessage("Veuillez entrer un nombre valide de chambres.");
      setShowModal(true);
      return;
    }

    if (!form.nombreLits || isNaN(form.nombreLits) || form.nombreLits <= 0) {
      setModalMessage("Veuillez entrer un nombre valide de lits.");
      setShowModal(true);
      return;
    }

    if (!form.nombreSallesDeBain || isNaN(form.nombreSallesDeBain) || form.nombreSallesDeBain <= 0) {
      setModalMessage("Veuillez entrer un nombre valide de salles de bain.");
      setShowModal(true);
      return;
    }

    if (form.pictures.length === 0) {
      setModalMessage("Veuillez télécharger au moins une photo du bien.");
      setShowModal(true);
      return;
    }

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

      setSuccessMessage("Annonce créée avec succès !");
      setTimeout(() => {
        navigate("/mesBiens");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la création de l'annonce:", error);
    }
  };

  return (
    <div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Attention</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
      <form onSubmit={handleSubmit}>
        <div className="createAnnonce">
          <h2>Ajouter une annonce</h2>
          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}
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
            type="text"
            placeholder="Description"
            name="description"
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
          <input
            className="input"
            type="text"
            placeholder="Adresse"
            name="adresse"
            value={form.adresse}
            onChange={handleChange}
          />
          <br />
          <br />
          <label htmlFor="pictures">Photos du bien :</label>
          <input
            type="file"
            name="pictures"
            accept="image/*"
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
          <div className="typeDePropriete">
            <h5>Type de propriété</h5>
            <select
              className="input"
              name="typeDePropriete"
              id="typeDePropriete"
              value={form.typeDePropriete}
              onChange={handleChange}
            >
              <option value="Maison">Maison</option>
              <option value="Appartement">Appartement</option>
              <option value="Maison d'hôtes">Maison d'hôtes</option>
              <option value="Hôtel">Hôtel</option>
            </select>

            <h5>Chambres</h5>
            <input
              className="input"
              type="number"
              name="nombreChambres"
              value={form.nombreChambres}
              onChange={handleChange}
            />

            <h5>Lits</h5>
            <input
              className="input"
              type="number"
              name="nombreLits"
              value={form.nombreLits}
              onChange={handleChange}
            />

            <h5>Salles de bain</h5>
            <input
              className="input"
              type="number"
              name="nombreSallesDeBain"
              value={form.nombreSallesDeBain}
              onChange={handleChange}
            />
          </div>
          <div className="equipments">
            <h5>Équipements</h5>
            <label>
              <input
                type="checkbox"
                name="wifi"
                className="form-check-input"
                checked={form.wifi}
                onChange={handleChange}
              />
              Wifi
            </label>
            <label>
              <input
                type="checkbox"
                name="cuisine"
                className="form-check-input"
                checked={form.cuisine}
                onChange={handleChange}
              />
              Cuisine
            </label>
            <label>
              <input
                type="checkbox"
                name="balcon"
                className="form-check-input"
                checked={form.balcon}
                onChange={handleChange}
              />
              Balcon
            </label>
            <label>
              <input
                type="checkbox"
                name="jardin"
                className="form-check-input"
                checked={form.jardin}
                onChange={handleChange}
              />
              Jardin
            </label>
            <label>
              <input
                type="checkbox"
                name="parking"
                className="form-check-input"
                checked={form.parking}
                onChange={handleChange}
              />
              Parking
            </label>
            <label>
              <input
                type="checkbox"
                name="piscine"
                className="form-check-input"
                checked={form.piscine}
                onChange={handleChange}
              />
              Piscine
            </label>
            <label>
              <input
                type="checkbox"
                name="jaccuzzi"
                className="form-check-input"
                checked={form.jaccuzzi}
                onChange={handleChange}
              />
              Jaccuzzi
            </label>
            <label>
              <input
                type="checkbox"
                name="salleDeSport"
                className="form-check-input"
                checked={form.salleDeSport}
                onChange={handleChange}
              />
              Salle de sport
            </label>
            <label>
              <input
                type="checkbox"
                name="climatisation"
                className="form-check-input"
                checked={form.climatisation}
                onChange={handleChange}
              />
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
