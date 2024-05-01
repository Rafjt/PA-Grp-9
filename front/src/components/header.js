import "./header.css";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Cookies from 'js-cookie';
import { useEffect, useState } from "react";

const Header = () => {
  // Check if the user is connected
   // Initialize isConnected state and set it based on the cookie value
   const [isConnected, setIsConnected] = useState(!!Cookies.get('connect.sid'));

   // Check for changes in the cookie value on component mount
   useEffect(() => {
     const checkSession = () => {
       const sessionCookie = Cookies.get('connect.sid');
       setIsConnected(!!sessionCookie);
     };
 
     // Call checkSession once to set the initial state
     checkSession();
 
     // Set up interval to check for changes in the cookie value periodically
     const intervalId = setInterval(checkSession, 1000);
 
     // Clean up the interval when the component unmounts
     return () => clearInterval(intervalId);
   }, []);
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
                Acceuil
              </a>
            </li>
            <li className="locali">
              <a href="/backOffice" className="text-white ml-3">
                Mon espace
              </a>
            </li>
            {/* Conditionally render "Connexion" or user logo */}
            {!isConnected ? (
              <li className="locali">
                <a href="/login" className="text-white ml-3 mr-2"> {/* Add mr-2 for margin right */}
                  Connexion
                </a>
              </li>
            ) : (
              <li className="locali mr-3">
                <a href="/userProfile">
                  <img className="user-logo" src="/logouser.png" alt="User Logo" />
                </a>
              </li>
            )}
            <li className="locali mr-3">
                <span>
                </span>
              </li>
              <li className="locali mr-3">
                <span>
                </span>
              </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
