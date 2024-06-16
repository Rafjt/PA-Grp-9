import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./acceuil.css";
import { useTranslation } from 'react-i18next';

const Acceuil = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `
      window.embeddedChatbotConfig = {
        chatbotId: "7LgUyPeesiNhz8OTEf6Y8",
        domain: "www.chatbase.co"
      };
    `;
    document.head.appendChild(script);

    const script2 = document.createElement("script");
    script2.src = "https://www.chatbase.co/embed.min.js";
    script2.setAttribute("chatbotId", "7LgUyPeesiNhz8OTEf6Y8");
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
      <div className="custom-margin mt-4 fs-4 mb-4">{t('whoWeAre')}</div>
      <div className="mt-6 mb-6 text-start" dangerouslySetInnerHTML={{ __html: t('description') }}></div>
      <NavLink to="/signup">
        <button type="button" className="btn btn-dark btn-lg mt-4">
          {t('signUp')}
        </button>
      </NavLink>
      <hr />
      <NavLink to="/Biens">
        <button type="button" className="btn btn-dark btn-lg">
          {t('rentProperty')}
        </button>
      </NavLink>
    </div>
  );
};

export default Acceuil;
