import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCredentials, insertAbonnementInfos } from "../services.js";

const PaiementAbonnement = () => {
  const [success, setSuccess] = useState(false);
  const [typeAbonnement, setTypeAbonnement] = useState("");
  const [price, setPrice] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentSuccess = params.get("success");
  const paymentCanceled = params.get("canceled");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedTypeAbonnement = sessionStorage.getItem("typeAbonnement");
        const storedPrice = sessionStorage.getItem("price");

        if (!storedTypeAbonnement || !storedPrice) {
          navigate("/login");
          return;
        }
        const userData = await getCredentials();
        setUser(userData);
        console.log(userData);

        if (
          paymentSuccess === "true" &&
          storedPrice &&
          storedTypeAbonnement
        ) {
          console.log(storedPrice);
          console.log(userData.type);
          console.log(userData.id);

          setTypeAbonnement(storedTypeAbonnement);
          setPrice(storedPrice);
          setSuccess(true);
          sessionStorage.removeItem("price");
          sessionStorage.removeItem("typeAbonnement");
          await insertAbonnementInfos(
            storedTypeAbonnement,
            userData.id,
            userData.type,
            storedPrice
          );
        } else if (paymentCanceled === "true"){
            sessionStorage.removeItem("price");
            sessionStorage.removeItem("typeAbonnement");
        }
      } catch (error) {
        console.error(
          "Error fetching user info or inserting abonnement info",
          error
        );
      }
    };

    if (!user) {
      fetchData();
    }
  }, [paymentSuccess, user, navigate, paymentCanceled]);
  return (
    <div className="container mt-4">
      <div className="order-status shadow p-4 shadow mt-5">
        {success ? (
          <div>
            <h1 className="text-success">
              Merci de vous être abonné à nos services
            </h1>
            <p>
              Vous avez choisi l'abonnement de type{" "}
              <span className="order-number">{typeAbonnement}</span>
            </p>
            <p>Vous recevrez bientôt une confirmation par e-mail.</p>
            <p>Coût de la première écheance : {price} €</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/userProfile")}
            >
              MON COMPTE
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/")}>
              ACCUEIL
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-danger">Paiement annulé</h1>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/userProfile")}
            >
              MON COMPTE
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/")}>
              ACCUEIL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaiementAbonnement;
