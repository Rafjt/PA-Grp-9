import React, { useEffect, useState } from "react";
import { useParams, Link } from 'react-router-dom';
import { fetchAnnonceById, updateAnnonce, BACK_URL } from "../services";
import './updateAnnonce.css';

const UpdateAnnonce = () => {
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState(null);
  const [annonceData, setAnnonceData] = useState(null);
  const [values, setValues] = useState({
    description: '',
    nomBien: '',
    statutValidation: '',
    pictures: [],
    ville: '',
    adresse: '',
    disponible: '1',
    id: '',
    id_ClientBailleur: '',
    prix: '',
    typeDePropriete: 'Maison',
    nombreChambres: 0,
    nombreLits: 0,
    nombreSallesDeBain: 0,
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

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchAnnonceById(id)
      .then((data) => {
        if (loading) {
          const initialData = {
            description: data.description,
            nomBien: data.nomBien,
            cheminImg: data.cheminImg,
            ville: data.ville,
            adresse: data.adresse,
            disponible: data.disponible,
            id_ClientBailleur: data.id_ClientBailleur,
            prix: data.prix,
            typeDePropriete: data.typeDePropriete,
            nombreChambres: data.nombreChambres,
            nombreLits: data.nombreLits,
            nombreSallesDeBain: data.nombreSallesDeBain,
            wifi: data.wifi,
            cuisine: data.cuisine,
            balcon: data.balcon,
            jardin: data.jardin,
            parking: data.parking,
            piscine: data.piscine,
            jaccuzzi: data.jaccuzzi,
            salleDeSport: data.salleDeSport,
            climatisation: data.climatisation
          };
          setValues(initialData);
          setInitialValues(initialData);
          setLoading(false);
        }
      })
      .catch((error) => console.log(error));
  }, [id, loading]);

  const hasFormChanged = () => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (e.target.type === 'file') {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setValues({
        ...values,
        cheminImg: selectedFiles
      });
    } else {
      setValues({
        ...values,
        [name]: value,
      });
    }
    console.log(values); 
  }
  

  const handleModify = async (e) => {
    e.preventDefault();
    try {
      const data = await updateAnnonce(id, values, files);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchData = async () => {
    try {
      const data = await fetchAnnonceById(id);
      setAnnonceData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);


  return (
    <div className="container-fluid mt-5 mr-0 ml-0 w-100">
      <div className="row">
        <div className="col">
          <div className="margin mt-2 fs-2 mb-2">
            <h5>
              <b>Modifier l'annonce</b>
            </h5>
          </div>
        </div>
      </div>
      {annonceData && (
        <form className="modif" onSubmit={handleModify}>
          <div className="gallery-container-Update">
            {files.length > 0 ? (
              files.map((file, index) => (
                <img
                  key={index}
                  className="gallery-item-Update"
                  src={URL.createObjectURL(file)}
                  alt={values.nomBien}
                />
              ))
            ) : (
              annonceData.images.map((image, index) => (
                <img
                  key={index}
                  className="gallery-item-Update"
                  src={`${BACK_URL}/${image}`}
                  alt={`${values.nomBien}-${index}`}
                />
              ))
            )}
          </div>
          <br />
          <label htmlFor="pictures">Modifier l'image :</label>
          <input type="file" name="pictures" onChange={handleChange} multiple />
          <br />
          <input className="input" type="text" name="nomBien" placeholder="Nom Bien" value={values.nomBien} onChange={handleChange} />
          <input className="input" type="text" name="description" placeholder="description" value={values.description} onChange={handleChange} />
          <input className="input" type="number" name="prix" placeholder="prix" value={values.prix} onChange={handleChange} />
          <input className="input" type="number" name="id_ClientBailleur" placeholder="id_ClientBailleur" value={values.id_ClientBailleur} onChange={handleChange} />
          <br />
          <label htmlFor="typeDePropriete">Type de propriété :</label>
          <select
            name="typeDePropriete"
            id="typeDePropriete"
            value={values.typeDePropriete}
            onChange={handleChange}>
            <option value="Maison">Maison</option>
            <option value="Appartement">Appartement</option>
            <option value="Maison d'hôtes">Maison d'hôtes</option>
            <option value="Hôtel">Hôtel</option>
          </select>
          <br />
          <label htmlFor="ville">Ville :</label>
          <select name="ville" value={values.ville} onChange={handleChange}>
            <option value="Paris">Paris</option>
            <option value="Nice">Nice</option>
            <option value="Biarritz">Biarritz</option>
          </select>
          <br />
          <input className="input" type="text" name="adresse" placeholder="adresse" value={values.adresse} onChange={handleChange} />
          <br />
          <input className="input" type="number" name="nombreChambres" placeholder="nombreChambres" value={values.nombreChambres} onChange={handleChange} />
          <input className="input" type="number" name="nombreLits" placeholder="nombreLits" value={values.nombreLits} onChange={handleChange} />
          <input className="input" type="number" name="nombreSallesDeBain" placeholder="nombreSallesDeBain" value={values.nombreSallesDeBain} onChange={handleChange} />
          <br />
          <label htmlFor="wifi">Wifi :</label>
          <select name="wifi" id="wifi" value={values.wifi} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <label htmlFor="cuisine">Cuisine :</label>
          <select name="cuisine" id="cuisine" value={values.cuisine} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <label htmlFor="balcon">Balcon :</label>
          <select name="balcon" id="balcon" value={values.balcon} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <label htmlFor="jardin">Jardin :</label>
          <select name="jardin" id="jardin" value={values.jardin} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <br />
          <label htmlFor="parking">Parking :</label>
          <select name="parking" id="parking" value={values.parking} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <label htmlFor="piscine">Piscine :</label>
          <select name="piscine" id="piscine" value={values.piscine} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <label htmlFor="jaccuzzi">Jaccuzzi :</label>
          <select name="jaccuzzi" id="jaccuzzi" value={values.jaccuzzi} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <label htmlFor="salleDeSport">Salle de sport :</label>
          <select name="salleDeSport" id="salleDeSport" value={values.salleDeSport} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <label htmlFor="climatisation">Climatisation :</label>
          <select name="climatisation" id="climatisation" value={values.climatisation} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <br />
          <label htmlFor="disponible">Disponible :</label>
          <select name="disponible" id="disponible" value={values.disponible} onChange={handleChange}>
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
          <br />
          <button type="submit" disabled={!hasFormChanged()}>Modifier</button>
          <Link style={{
          backgroundColor: "LightGreen",
          Color: "black",
          borderRadius: "5px",
          padding: "1%",
        }} to="/gestionAnnonce">Terminer</Link>
        </form>
      )}
    </div>
  );
};

export default UpdateAnnonce;
