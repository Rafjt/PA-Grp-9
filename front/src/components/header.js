import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { getCredentials } from "../services";
import { useTranslation } from "react-i18next";

const Header = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await getCredentials();
        if (userData) {
          setUser(userData);
          setUserType(userData.type);
          setIsConnected(true);
          if (userData.admin === 1) {
            setIsAdmin(true);
          }
        } else {
          setIsConnected(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsConnected(false);
        setIsAdmin(false);
      }
    };

    checkSession();

    let executionCount = 0;
    const intervalId = setInterval(() => {
      if (executionCount < 1) {
        checkSession();
        executionCount++;
      } else {
        clearInterval(intervalId);
        const tenMinutesIntervalId = setInterval(checkSession, 10 * 60 * 1000);
        return () => clearInterval(tenMinutesIntervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getMonEspaceLink = () => {
    switch (userType) {
      case "voyageurs":
        return "/espaceVoyageur";
      case "clientsBailleurs":
        return "/espaceBailleur";
      case "prestataires":
        return "/espacePrestataire";
      default:
        return "/acceuil";
    }
  };

  const changeLangage = (language) => {
    const currentLanguage = sessionStorage.getItem("langage");
    if (language === "en" && currentLanguage !== "en") {
      sessionStorage.setItem("langage", "en");
      i18n.changeLanguage("en");
    } else if (language === "fr" && currentLanguage !== "fr") {
      sessionStorage.removeItem("langage");
      i18n.changeLanguage("fr");
    }
  };

  return (
    <header className="header sticky-top">
      <div className="upper-section">
        <div className="envs">
          {isConnected ? (
            <span className="env">
              {userType === "clientsBailleurs" && t("bailleur")}
              {userType === "voyageurs" && t("voyageur")}
              {userType === "prestataires" && t("prestataire")}
            </span>
          ) : (
            <span className="env" data-translate="welcome">
              {t("welcome")}
            </span>
          )}
        </div>
      </div>
      <div className="lower-section text-white sticky-top">
        <nav className="mr-2">
          <ul className="list-unstyled">
            <li className="locali">
              <a id="en" onClick={() => changeLangage("en")}>
                <img className="icon" src="/logouk.ico" alt="Logo UK" />
              </a>
            </li>
            <li className="locali">
              <a id="fr" onClick={() => changeLangage("fr")}>
                <img className="icon" src="/logofrance.ico" alt="Logo France" />
              </a>
            </li>
            <li className="locali">
              <a href="/" className="text-white ml-3" data-translate="Accueil">
                {t("accueil")}
              </a>
            </li>
            {isAdmin && (
              <li className="locali">
                <a
                  href="/backOffice"
                  className="text-white ml-3"
                  data-translate="Gestion BackOffice"
                >
                  {t("gestionBackoffice")}
                </a>
              </li>
            )}
            {isConnected && (
              <li className="locali">
                <a
                  href={getMonEspaceLink()}
                  className="text-white ml-3"
                  data-translate="Mon espace"
                >
                  {t("monEspace")}
                </a>
              </li>
            )}
            {!isConnected ? (
              <li className="locali">
                <a href="/login" className="text-white ml-3 mr-2">
                  {" "}
                  {t("connexion")}
                </a>
              </li>
            ) : (
              <li className="locali mr-3">
                <a href="/userProfile">
                  <img
                    className="user-logo"
                    src="/logouser.png"
                    alt="User Logo"
                  />
                </a>
              </li>
            )}
            <li className="locali mr-3">
              <span></span>
            </li>
            <li className="locali mr-3">
              <span></span>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
