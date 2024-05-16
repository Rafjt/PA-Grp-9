import "./header.css";
import { Link, useRoutes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { getCredentials } from "../services";

const Header = () => {
  // Check if the user is connected
  // Initialize isConnected state and set it based on the cookie value
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await getCredentials();
        if (userData) {
          setUser(userData);
          setUserType(userData.type);
          setIsConnected(true); // Assuming isAdmin is a property indicating admin status
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

    // Call checkSession once to set the initial state
    checkSession();

    // Set up interval to check for changes in the user session periodically
    let executionCount = 0;
    const intervalId = setInterval(() => {
      if (executionCount < 1) {
        // Execute the function
        checkSession();
        executionCount++;
      } else {
        // Clear the interval after executing the function three times
        clearInterval(intervalId);
        // Set up interval to execute the function every 10 minutes
        const tenMinutesIntervalId = setInterval(checkSession, 10 * 60 * 1000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(tenMinutesIntervalId);
      }
    }, 1000);

    // Clean up the initial interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const getMonEspaceLink = () => {
    if (userType === "voyageurs") {
      return "/espaceVoyageur";
    } else if (userType === "clientsBailleurs") {
      return "/espaceBailleur";
    } else if (userType === "prestataires") {
      return "/espacePrestataire";
    } else {
      // Handle default case, e.g., return a generic URL
      return "/acceuil";
    }
  };

  return (
    <header className="header sticky-top">
      <div className="upper-section">
        <div className="envs">
          <span className="env">
            <a href="/env">Bailleurs</a>
          </span>
          <span className="env">Voyageurs</span>
          <span className="env">Prestataires</span>
        </div>
      </div>
      <div className="lower-section text-white sticky-top">
        <nav className="mr-2">
          <ul className="list-unstyled">
            <li className="locali">
              <a href="#">
                <img className="icon" src="/logouk.ico" alt="Logo UK" />
              </a>
            </li>
            <li className="locali">
              <a href="#">
                <img className="icon" src="/logofrance.ico" alt="Logo France" />
              </a>
            </li>
            <li className="locali">
              <a href="/" className="text-white ml-3">
                Accueil
              </a>
            </li>
            {isAdmin && (
              <li className="locali">
                <a href="/backOffice" className="text-white ml-3">
                  Gestion BackOffice
                </a>
              </li>
            )}
            {isConnected && (
              <li className="locali">
                <a href={getMonEspaceLink()} className="text-white ml-3">
                  Mon espace
                </a>
              </li>
            )}
            {/* Conditionally render "Connexion" or user logo */}
            {!isConnected ? (
              <li className="locali">
                <a href="/login" className="text-white ml-3 mr-2">
                  {" "}
                  {/* Add mr-2 for margin right */}
                  Connexion
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
