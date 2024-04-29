import "./header.css";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = () => {
  return (
    <header className="header" class="sticky-top">
      <div className="upper-section">
        <div className="envs">
          <span class="env">
            <a href="/env">Bailleurs</a>
          </span>
          <span class="env">Voyageurs</span>
          <span class="env">Prestataires</span>
        </div>
      </div>
      <div class="lower-section text-white sticky-top">
        <nav class="mr-2">
          <ul class="list-unstyled">
            <li class="locali">
              <a href="#">
                <img className="icon" src="/logouk.ico" alt="Logo UK" />
              </a>
            </li>
            <li class="locali">
              <a href="#">
                <img className="icon" src="/logofrance.ico" alt="Logo France" />
              </a>
            </li>
            <li class="locali">
              <a href="/" class="text-white ml-3">
                Acceuil
              </a>
            </li>
            <li class="locali">
              <a href="/backOffice" class="text-white ml-3">
                Mon espace
              </a>
            </li>
            <li class="locali">
              <a href="/login" class="text-white ml-3">
                Connexion
              </a>
            </li>
            <li class="locali"></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
