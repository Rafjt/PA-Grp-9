import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./acceuil.css";

const Acceuil = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `
      window.embeddedChatbotConfig = {
        chatbotId: "PMzsVHu-Yo1-fWx4fih76",
        domain: "www.chatbase.co"
      };
    `;
    document.head.appendChild(script);

    const script2 = document.createElement("script");
    script2.src = "https://www.chatbase.co/embed.min.js";
    script2.setAttribute("chatbotId", "PMzsVHu-Yo1-fWx4fih76");
    script2.setAttribute("domain", "www.chatbase.co");
    script2.defer = true;
    document.body.appendChild(script2);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (document.body.contains(script2)) {
        document.body.removeChild(script2);
      }
    };
  }, []);

  return (
    <div className="container-fluid mt-0 mr-0 ml-0 w-100">
      <div className="col">
        <img src="paris-tour-eiffel.jpg" className="img-fluid" alt="" />
      </div>
      <div className="custom-margin mt-4 fs-4 mb-4">Qui sommes-nous ?</div>
      <div className="mt-6 mb-6 text-start">
        Nous, chez Paris Caretaker Services (PCS), formons une chaîne de conciergeries immobilières spécialisées dans la gestion locative saisonnière, s'inspirant du modèle bien connu d'Airbnb. Notre aventure a débuté en 2018 à Paris, et depuis lors, notre croissance fulgurante découle de notre engagement envers la qualité de l'accueil et la diversité de nos services.<br/><br/>
        Nous offrons une solution complète aux propriétaires cherchant à louer leurs biens, éliminant ainsi la charge administrative associée à la location. Nous prenons en charge chaque étape du processus, du check-in et check-out des clients au nettoyage du logement, de la publication d'annonces attrayantes à la communication avec les voyageurs, en passant par l'entretien et les réparations nécessaires.<br/><br/>
        Notre plateforme en ligne simplifie le processus, permettant aux propriétaires de demander des simulations de devis, tandis que les voyageurs ont accès à une gamme variée de services. Notre modèle économique repose sur des tarifs transparents, généralement 20% du prix de la nuitée de location, avec des frais fixes et logistiques supplémentaires. Grâce à notre succès à Paris, nous avons étendu notre présence à d'autres arrondissements de la capitale ainsi qu'à des destinations touristiques telles que Nice et Biarritz.
      </div>
      <NavLink to="/signup">
        <button type="button" className="btn btn-dark btn-lg mt-4">
          S'inscrire
        </button>
      </NavLink>
      <hr />
      <NavLink to="/Biens">
        <button type="button" className="btn btn-dark btn-lg">
          Louer un bien
        </button>
      </NavLink>
    </div>
  );
};

export default Acceuil;
