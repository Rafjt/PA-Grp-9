import React, { useEffect, useState } from "react";
import "./userProfile.css";
import { getCredentials, deleteUser } from "../services";
import Prompt from "../components/prompt.js";
import * as Yup from "yup";
import {
  updateUser,
  updateCookie,
  checkAbonnement,
  resilierAbonnement,
} from "../services";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UserProfile = () => {
  const nomRegex =
    /^[a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ '-]*$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const now = new Date();
  const minDate = new Date(now);
  minDate.setFullYear(minDate.getFullYear() - 100);
  minDate.setDate(now.getDate() + 1);

  const maxDate = new Date(now);
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  maxDate.setDate(now.getDate());

  const [showPrompt, setShowPrompt] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [abonnements, setAbonnements] = useState([]);
  const [showAbonnementPrompt, setShowAbonnementPrompt] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCredentials();
        if (userData) {
          setUser(userData);
          setUserType(userData.type); // Assuming `type` is available in user data

          if (userData.type === "voyageurs") {
            const { abonnements } = await checkAbonnement(userData.id);
            setAbonnements(abonnements);
            console.log(abonnements);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);
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

  const validationSchema = Yup.object().shape({
    nom: Yup.string()
      .matches(nomRegex, t("nomValidation"))
      .required(t("requiredField"))
      .min(1, t("nomMin"))
      .max(30, t("nomMax")),
    prenom: Yup.string()
      .matches(nomRegex, t("prenomValidation"))
      .required(t("requiredField"))
      .min(1, t("prenomMin"))
      .max(30, t("prenomMax")),
    dateDeNaissance: Yup.date()
      .required(t("requiredField"))
      .min(minDate, t("dateMin"))
      .max(maxDate, t("dateMax")),
    adresseMail: Yup.string()
      .matches(emailRegex, t("emailValidation"))
      .email(t("invalidEmail"))
      .required(t("requiredField"))
      .max(50, t("emailMax")),
  });

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
      await deleteUser(user.id, user.type);
      handleDisconnect();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const cancelDeleteAccount = () => {
    setShowPrompt(false);
  };

  const handleEditMode = () => {
    if (!editMode) {
      // Entering edit mode, save current user data to inputValues state
      setInputValues(user);
    }
    setEditMode(!editMode);
  };

  // Separate state to hold input values
  const [inputValues, setInputValues] = useState({
    nom: "",
    prenom: "",
    adresseMail: "",
    dateDeNaissance: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    nom: "",
    prenom: "",
    dateDeNaissance: "",
    adresseMail: "",
  });

  // Function to update input values
  const handleInputChange = (e, field) => {
    const newValue = e.target.value;
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [field]: newValue,
    }));
  };

  // Function to handle saving changes
  const handleSaveChanges = () => {
    validationSchema
      .validate(inputValues, { abortEarly: false })
      .then(() => {
        // If validation succeeds, update user state with input values and disable edit mode
        setUser(inputValues);
        setEditMode(false);
        // Clear validation errors
        setValidationErrors({
          nom: "",
          prenom: "",
          dateDeNaissance: "",
          adresseMail: "",
        });

        // Call the updateUser service
        updateUser(user.id, user.type, inputValues)
          .then((userData) => {
            console.log("User updated:", userData);
            document.cookie =
              "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            // After updating the user, call the updateCookie service
            updateCookie(user.id, user.type, inputValues)
              .then((cookieData) => {
                console.log("Cookie updated:", cookieData);
              })
              .catch((error) => {
                console.error("Error updating cookie:", error);
              });
          })
          .catch((error) => {
            console.error("Error updating user:", error);
          });
      })
      .catch((error) => {
        // If validation fails, update the validation errors state
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setValidationErrors(errors);
      });
  };

  // Function to handle canceling edit mode
  const handleCancelEditMode = () => {
    setEditMode(false);
    // Reset input values to current user state
    setInputValues(user);
    setValidationErrors({
      nom: "",
      prenom: "",
      dateDeNaissance: "",
      adresseMail: "",
    });
  };

  function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const renderInputField = (label, value, id, onChange, error) => {
    return (
      <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
        <div className="form-group">
          <label htmlFor={id}>{label}</label>
          {id === "dateNaissance" ? (
            <input
              type="date"
              className="form-control"
              id={id}
              value={editMode ? inputValues[id] : value}
              readOnly={!editMode}
              onChange={onChange}
            />
          ) : (
            <input
              type="text"
              className="form-control"
              id={id}
              placeholder={label}
              value={editMode ? inputValues[id] : value}
              readOnly={!editMode}
              onChange={onChange}
            />
          )}
          {error && <div className="text-danger">{error}</div>}
        </div>
      </div>
    );
  };

  const handleResilitation = () => {
    setShowAbonnementPrompt(true);
  };

  const confirmResilitation = async () => {
    try {
      await resilierAbonnement(user.id);
      const newAbonnementData = await checkAbonnement(user.id);
      setAbonnements(newAbonnementData.abonnements); 
      setShowAbonnementPrompt(false); 
    } catch (error) {
      console.error("Error en resiliant l'abonnement", error);
    }
  };

  const renderAbonnement = (abonnement) => {
    if (
      abonnement.type === "Bag_Packer_annual" ||
      abonnement.type === "Bag_Packer_monthly"
    ) {
      abonnement.type = "Bag Packer";
    } else if (
      abonnement.type === "Explorator_annual" ||
      abonnement.type === "Explorator_monthly"
    ) {
      abonnement.type = "Explorator";
    }

    return (
      <div key={abonnement.id} className="abonnement-item">
        <h6>Type: {abonnement.type}</h6>
        <p>
          {t("typeEcheance")} {abonnement.typeEcheance}
        </p>
        <p>
          {t("dateDebut")} {formatDate(abonnement.dateDebut)}
        </p>
        <p>
          {t("renouvellementDate")} {formatDate(abonnement.dateRenouvellement)}
        </p>
        {/* Render other abonnement fields as needed */}
      </div>
    );
  };

  return (
    <div className="container mt-5">
      <div className="row gutters">
        <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12 mr-1">
          <div className="card h-100 shadow">
            <div className="card-body shadow">
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
                {userType === "voyageurs" ? (
                  <div className="abonnement-info mt-4">
                    <h5>{t("abonnementEnCours")}</h5>
                    {abonnements.length > 0 ? (
                      abonnements.map((abonnement) =>
                        renderAbonnement(abonnement)
                      )
                    ) : (
                      <span>{t("pasDabonnement")}</span>
                    )}
                  </div>
                ) : (
                  <span></span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12">
          <div className="card h-100 shadow">
            <div className="card-body shadow">
              <div className="row gutters">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <h6 className="mb-2 text-primary">{t("compteDetail")}</h6>
                </div>
                {/* Render input fields with validation errors */}
                {renderInputField(
                  t("Nom"),
                  user ? user.nom : "",
                  "nom",
                  (e) => handleInputChange(e, "nom"),
                  validationErrors.nom // Pass the validation error for the field
                )}
                {renderInputField(
                  t("Prénom"),
                  user ? user.prenom : "",
                  "prenom",
                  (e) => handleInputChange(e, "prenom"),
                  validationErrors.prenom // Pass the validation error for the field
                )}
                {renderInputField(
                  "Email",
                  user ? user.adresseMail : "",
                  "adresseMail",
                  (e) => handleInputChange(e, "adresseMail"),
                  validationErrors.adresseMail // Pass the validation error for the field
                )}
                {renderInputField(
                  t("Date de Naissance"),
                  user ? user.dateDeNaissance : "",
                  "dateNaissance",
                  (e) => handleInputChange(e, "dateDeNaissance"),
                  validationErrors.dateDeNaissance // Pass the validation error for the field
                )}
              </div>
              <div className="row gutters"></div>
              <div className="row gutters">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                  <div className="text-right mt-3">
                    {editMode ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary mr-2"
                          onClick={handleCancelEditMode}
                        >
                          {t("annuler")}
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary mr-2"
                          onClick={handleSaveChanges}
                        >
                          {t("terminer")}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary mr-2"
                        onClick={handleEditMode}
                      >
                        {t("modifInfo")}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger mr-2"
                      onClick={handleDeleteAccount}
                    >
                      {t("suppCompte")}
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
                {userType === "voyageurs" ? (
                  <div>
                    {abonnements !== null ? (
                      abonnements.length < 1 ? (
                        <Link
                          to="/abonnement"
                          className="btn btn-primary custom-link"
                        >
                          <span>{t("consulterOffre")}</span>
                        </Link>
                      ) : (
                        <button
                          className="btn btn-primary custom-link"
                          onClick={handleResilitation}
                        >
                          <span>{t("gererAbo")}</span>
                        </button>
                      )
                    ) : (
                      <span>Loading...</span>
                    )}
                  </div>
                ) : (
                  <span></span>
                )}
              </div>
              {showAbonnementPrompt && (
                <Prompt
                  message={t("confirmAbonnementCancellation")}
                  onConfirm={confirmResilitation}
                  onCancel={() => setShowAbonnementPrompt(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="text-right mt-3">
        <button
          type="button"
          id="logout"
          name="logout"
          className="btn btn-danger shadow"
          onClick={handleDisconnect}
        >
          {t("logout")}
          <span>&times;</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
