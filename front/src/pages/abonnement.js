// Abonnement.js
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./abonnement.css";
import PromptChoix from "../components/promptChoix"; 

const Abonnement = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleClose = () => setShowPrompt(false);
  const handleShow = (plan) => {
    setSelectedPlan(plan);
    setShowPrompt(true);
  };

  const handleSelection = (option) => {
    console.log(`Selected ${option} plan for ${selectedPlan}`);
    // Implement your logic to proceed with the selected option here
    setShowPrompt(false);
  };

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
          <div className="price">9,90€ <span>par mois</span></div>
          <div className="price-par-an">113€ <span>par an</span></div>
          <button className="select-button" onClick={() => handleShow('Bag Packer')}>SELECT</button>
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
          <div className="price">19€ <span>par mois</span></div>
          <div className="price-par-an">220€ <span>par an</span></div>
          <button className="select-button" onClick={() => handleShow('Explorator')}>SELECT</button>
        </div>
      </div>

      <PromptChoix show={showPrompt} handleClose={handleClose} handleSelection={handleSelection} />
    </div>
  );
};

export default Abonnement;
