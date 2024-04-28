import React from "react";
import "./login.css";

function Login() {
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
        <form>
          <div className="mb-3">
            <input
              className="input form-control"
              type="text"
              placeholder="Adresse email"
              style={{ width: "100%" }}
            />
          </div>
          <div className="mb-3">
            <input
              className="input form-control"
              type="password"
              placeholder="Mot de passe"
              style={{ width: "100%" }}
            />
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
