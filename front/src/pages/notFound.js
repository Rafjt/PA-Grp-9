import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container text-center">
      <div className="m-4">
        <h1>Erreur 404 - Not Found</h1>
        <h4>La page que vous cherchez n'existe pas ou a été supprimée</h4>
      </div>
      <img src="/nooo.gif" alt="Nope" className="img-fluid mx-auto d-block my-4" style={{ width: "300px" }} />
      <hr />
      <div className="my-4">
        <h5>Voici quelques liens pour vous retrouver</h5>
        <ul className="list-unstyled">
          <li>
            <Link to="/">Accueil</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NotFound;
