import './header.css';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="upper-section">
        <div className="envs">
          <span class='env'><a href="/env">Bailleurs</a></span>
          <span class='env'>Voyageurs</span>
          <span class='env'>Prestataires</span>
        </div>
      </div>
      <div className="lower-section">
        <nav>
          <ul>
            <li class='locali'><a href="/">Acceuil</a></li>
            <li class='locali'><a href="/about">Mon espace</a></li>
            <li class='locali'><a href="/pages/login">Connexion</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
