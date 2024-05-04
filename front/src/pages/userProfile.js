import React from "react";
import "./userProfile.css";
import { useEffect } from "react";
import { useState } from "react";
import Cookies from "js-cookie";
import { getCredentials } from "../services";
import Prompt from "../components/prompt";
import { deleteUser } from "../services";

const UserProfile = () => {
  // Function to format user type

  const [showPrompt, setShowPrompt] = useState(false);

  const formatUserType = (type) => {
    switch (type) {
      case "voyageurs":
        return "Voyageur";
      case "clientsBailleurs":
        return "Bailleur";
      case "prestataires":
        return "Prestataire";
      default:
        return type; // Return the type as is if it doesn't match any specific rule
    }
  };

  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    getCredentials().then((userData) => {
      setUser(userData);
      setUserType(userData.type); // Assuming `type` is available in user data
    });
  }, []);

  const handleDisconnect = async () => {
    document.cookie =
      "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.replace("/..");
  };

  const handleDeleteAccount = () => {
    setShowPrompt(true);
  };

  const confirmDeleteAccount = async () => {
    try {
        const userId = user.id;
        const userType = user.type;
        console.log(userId);
        await deleteUser(userId, userType);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    console.log("Account deleted");
    handleDisconnect();
  };

  const cancelDeleteAccount = () => {
    setShowPrompt(false);
  };

  return (
    <div className="container mt-5">
      <div className="row gutters">
        <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
          <div className="card h-100">
            <div className="card-body">
              <div className="account-settings">
                <div className="user-profile">
                  <div className="user-avatar mt-5">
                    <img
                      src="logouser.png"
                      alt="Maxwell Admin"
                      style={{ width: "100px", height: "100px" }}
                    />
                  </div>
                  <h5 className="user-name">
                    {user ? `${user.prenom} ${user.nom}` : ""}
                  </h5>
                  <h6 className="user-email">{user ? user.adresseMail : ""}</h6>
                </div>
                <div className="about">
                  <h5>
                    {" "}
                    <i>{userType ? formatUserType(userType) : ""} </i>
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12">
          <div className="card h-100">
            <div className="card-body">
              <div className="row gutters">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <h6 className="mb-2 text-primary">Détails du compte</h6>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label htmlFor="nom">Nom</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nom"
                      placeholder="Nom"
                      value={user ? user.nom : ""}
                    />
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label htmlFor="prenom">Prénom</label>
                    <input
                      type="text"
                      className="form-control"
                      id="prenom"
                      placeholder="Prénom"
                      value={user ? user.prenom : ""}
                    />
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label htmlFor="adresseMail">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      id="adresseMail"
                      placeholder="Adresse Email"
                      value={user ? user.adresseMail : ""}
                    />
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label htmlFor="dateNaissance">Date de Naissance</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateNaissance"
                      placeholder="Date de Naissance"
                      value={user ? user.dateDeNaissance : ""}
                    />
                  </div>
                </div>
              </div>
              <div className="row gutters"></div>
              <div className="row gutters">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="text-right mt-3">
                    <button
                      type="button"
                      id="update"
                      name="update"
                      className="btn btn-primary mr-2"
                    >
                      Mettre à jour
                    </button>
                    <button
                      type="button"
                      id="delete"
                      name="delete"
                      className="btn btn-danger mr-2"
                      onClick={handleDeleteAccount}
                    >
                      Supprimer le compte
                    </button>
                    {showPrompt && (
                      <Prompt
                        message="Êtes-vous sûr de vouloir supprimer votre compte ?"
                        onConfirm={confirmDeleteAccount}
                        onCancel={cancelDeleteAccount}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-right mt-3">
        <button
          type="button"
          id="logout"
          name="logout"
          className="btn btn-danger"
          onClick={handleDisconnect}
        >
          Se déconnecter <span>&times;</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
