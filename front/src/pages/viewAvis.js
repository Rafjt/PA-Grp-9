import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAvis } from "../services";
import { Link } from "react-router-dom";
import "./viewAvis.css";

function ViewAvis() {
  const { prestationId, prestataireId } = useParams();
  const [avis, setAvis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAvis = async () => {
      try {
        const data = await fetchAvis(prestationId, prestataireId);
        console.log(data);
        setAvis(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadAvis();
  }, [prestationId, prestataireId]);


  return (
    <div className="avis-page">
      <Link to="/prestations" className="avis-retour-btn mt-5">
        Retour
      </Link>
      <div className="avis-container">
        <h2>Avis sur la prestation</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : avis ? (
          <div className="avis-card">
            <table
              className="details-board table table-bordered table-sm shadow rounded border-dark"
              style={{ width: "50%", margin: "0 auto" }}
            >
              <tbody>
                <tr>
                  <td>
                    <strong>Note:</strong>
                  </td>
                  <td>{avis.note}⭐</td>
                </tr>
                <tr>
                  <td>
                    <strong>Commentaire:</strong>
                  </td>
                  <td>{avis.commentaire}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Type d'intervention:</strong>
                  </td>
                  <td>{avis.typeIntervention}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p>Aucun avis trouvé pour cette prestation.</p>
        )}
      </div>
    </div>
  );
}

export default ViewAvis;
