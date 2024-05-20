import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAvis } from "../services";

function ViewAvis() {
  const { prestationId, prestataireId } = useParams();
  const [avis, setAvis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAvis = async () => {
      try {
        const response = await fetchAvis(prestationId, prestataireId);
        const jsonData = await response.json(); // Convert the response to JSON
        console.log(jsonData);
        setAvis(jsonData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    loadAvis();
  }, [prestationId, prestataireId]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

  return (
    <div className="avis-container">
      <h2>Avis sur la prestation</h2>
      {avis ? (
        <div>
          <p><strong>Note:</strong> {avis.note}</p>
          <p><strong>Commentaire:</strong> {avis.commentaire}</p>
          <p><strong>Type d'intervention:</strong> {avis.typeIntervention}</p>
          <p><strong>Bien Immobilier:</strong> {avis.id_BienImmobilier}</p>
          <p><strong>Prestation:</strong> {avis.id_Prestation}</p>
        </div>
      ) : (
        <p>Aucun avis trouvé pour cette prestation.</p>
      )}
    </div>
  );
}

export default ViewAvis;
