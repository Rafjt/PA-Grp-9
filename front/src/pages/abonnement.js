import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./abonnement.css";
import PromptChoix from "../components/promptChoix";
import { createAbonnementSession, getCredentials, checkAbonnement } from "../services";
import { Modal, Button } from "react-bootstrap";

const Abonnement = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const handleClose = () => setShowPrompt(false);

  const handleShow = (plan, prices) => {
    if (hasActiveSubscription) {
      setShowAlert(true);
    } else {
      setSelectedPlan(plan);
      setShowPrompt(true);
    }
  };

  const fetchData = async () => {
    const userData = await getCredentials();
    setUser(userData);
    if (userData && userData.id) {
      try {
        const abonnementInfo = await checkAbonnement(userData.id);
        setHasActiveSubscription(abonnementInfo.abonnementExists);
      } catch (error) {
        console.error("Failed to check abonnement", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPrice = (typeAbonnement, option) => {
    if (typeAbonnement.includes("Bag_Packer")) {
      return option === "monthly" ? "9.90" : "113";
    } else if (typeAbonnement.includes("Explorator")) {
      return option === "monthly" ? "19" : "220";
    }
    return null;
  };

  const handleSelection = async (option) => {
    const typeAbonnement = `${selectedPlan}_${option}`;
    const price = getPrice(typeAbonnement, option); // Use getPrice to determine the price
    console.log(`Selected ${option} plan for ${selectedPlan} with type: ${typeAbonnement}`);
    console.log(`Price for ${option} plan: ${price}`);

    try {
      sessionStorage.setItem("typeAbonnement", typeAbonnement);
      sessionStorage.setItem("price", price);
      await createAbonnementSession(typeAbonnement, user.id);
    } catch (error) {
      console.error("Failed to create checkout session", error);
    }

    setShowPrompt(false);
  };

  const handleAlertClose = () => setShowAlert(false);

  return (
    <div>
      <h1 className="mt-5">Offres disponibles</h1>
      <div className="pricing-table">
        <div className="pricing-card">
          <h3 className="pricing-title">Basique</h3>
          <ul className="pricing-features">
            <li className="feature">✅ Présence de publicités dans le contenu consulté</li>
            <li className="feature">✅ Commenter, publier des avis</li>
            <li className="feature">❌ Réduction permanente de 5% sur les prestations</li>
            <li className="feature">❌ Prestations offertes</li>
            <li className="feature">❌ Accès prioritaire à certaines prestations et aux prestations VIP</li>
            <li className="feature">❌ Bonus renouvellement de l'abonnement</li>
          </ul>
          <br />
          <div className="price mt-3">Gratuit</div>
          <br />
          <button className="select-button">SELECT</button>
        </div>

        <div className="pricing-card">
          <h3 className="pricing-title">Bag Packer</h3>
          <ul className="pricing-features">
            <li className="feature">❌ Présence de publicités dans le contenu consulté</li>
            <li className="feature">✅ Commenter, publier des avis</li>
            <li className="feature">✅ Réduction permanente de 5% sur les prestations</li>
            <li className="feature">✅ Prestations offertes</li>
            <li className="feature">❌ Accès prioritaire à certaines prestations et aux prestations VIP</li>
            <li className="feature">❌ Bonus renouvellement de l'abonnement</li>
          </ul>
          <div className="price">
            9,90€ <span>par mois</span>
          </div>
          <div className="price-par-an">
            113€ <span>par an</span>
          </div>
          <button
            className="select-button"
            onClick={() => handleShow("Bag_Packer", { par_mois: "9.90", par_an: "113" })}
          >
            SELECT
          </button>
        </div>

        <div className="pricing-card">
          <h3 className="pricing-title">Explorator</h3>
          <ul className="pricing-features">
            <li className="feature">❌ Présence de publicités dans le contenu consulté</li>
            <li className="feature">✅ Commenter, publier des avis</li>
            <li className="feature">✅ Réduction permanente de 5% sur les prestations</li>
            <li className="feature">✅ Prestations offertes</li>
            <li className="feature">✅ Accès prioritaire à certaines prestations et aux prestations VIP</li>
            <li className="feature">✅ Bonus renouvellement de l'abonnement</li>
          </ul>
          <div className="price">
            19€ <span>par mois</span>
          </div>
          <div className="price-par-an">
            220€ <span>par an</span>
          </div>
          <button
            className="select-button"
            onClick={() => handleShow("Explorator", { par_mois: "19", par_an: "220" })}
          >
            SELECT
          </button>
        </div>
      </div>

      <PromptChoix show={showPrompt} handleClose={handleClose} handleSelection={handleSelection} />

      <Modal show={showAlert} onHide={handleAlertClose} className="center">
        <Modal.Header closeButton>
          <Modal.Title>Abonnement existant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Vous avez déjà un abonnement, pour modifier ou supprimer votre offre, rendez-vous sur votre profil.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleAlertClose}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Abonnement;
