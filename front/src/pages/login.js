import React from 'react';
import Header from '../components/header.js';
import BackOffice from './backOffice.js'; 
import Footer from '../components/footer.js';
import './login.css';

function Login() {
    return (
      <div>
        <div className="login-container">
          <h2>Se connecter</h2>
          <form>
            <input class="input" type="text" placeholder="Nom d'utilisateur" />
            <input class="input" type="password" placeholder="Mot de passe" />
            <br />
            <button type="submit" class="btn btn-dark btn-lg mt-4">Se connecter</button>
          </form>
          <div>
            <p>Vous n'avez pas de compte ? <a href="/signup">S'inscrire</a></p>
          </div>
        </div>
      </div>
    );
  }
  
export default Login;
