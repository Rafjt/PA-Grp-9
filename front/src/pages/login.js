import React from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { login } from "../services";


function Login() {


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.elements.adresseMail.value;
    const password = e.target.elements.motDePasse.value;
    const type = e.target.elements.type.value;

    try {
      const response = await login(email, password, type);
      console.log(response.status); // Add this line
      if (response.status === 200) {
        console.log("Logged in");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        className="login-container rounded p-5 text-white"
        style={{
          backgroundImage: "linear-gradient(#080808, #1F1F1F)",
          boxShadow: "4.0px 8.0px 8.0px hsl(0deg 0% 0% / 0.38)",
        }}
      >
        <h2 className="mb-4">Se connecter</h2>
        <form onSubmit={(e) => handleSubmit(e, navigate)}>
          <div className="mb-3">
            <input
              className="input form-control"
              name="adresseMail"
              type="text"
              placeholder="Adresse email"
              style={{ width: "100%" }}
            />
          </div>
          <div className="mb-3">
            <input
              className="input form-control"
              name="motDePasse"
              type="password"
              placeholder="Mot de passe"
              style={{ width: "100%" }}
            />
          </div>
          <div className="mb-3">
            <select
              className="form-select"
              name="type"
              aria-label="Default select example"
              style={{ width: "100%" }}
            >
              <option value="voyageurs">Voyageur</option>
              <option value="clientsBailleurs">Bailleur</option>
              <option value="prestataires">Prestataire</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-dark btn-lg mt-4"
            style={{
              width: "100%",
              backgroundColor: "#000000",
              color: "#FFFFFF",
            }}
          >
            Se connecter
          </button>
        </form>
        <div className="mt-3">
          <p>
            Vous n'avez pas de compte ?{" "}
            <a href="/signup" className="text-white">
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
