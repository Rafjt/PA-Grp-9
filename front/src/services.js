// Define functions for backend calls
export const BACK_URL = process.env.REACT_APP_PCS_URL;
export const BASE_URL = `${BACK_URL}/api`;
export const URL_USERS = `${BASE_URL}/users`;
export const URL_ANNONCE = `${BASE_URL}/bienImo`;
export const URL_PAIEMENT = `${BASE_URL}/paiement`;
export const URL_ENVOI_MAIL = `${BASE_URL}/mail`;
export const URL_ABONNEMENT = `${BACK_URL}/abonnement`;
export const URL_RESERVATION = `${BASE_URL}/reservation`;
export const URL_AUTH = `${BACK_URL}/auth`;
// proutcacchoiassemerde
export const fetchUsers = async () => {
  try {
    const response = await fetch(URL_USERS);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchBailleurs = async () => {
  try {
    const response = await fetch(`${URL_USERS}/bailleurs`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchVoyageurs = async () => {
  try {
    const response = await fetch(`${URL_USERS}/voyageurs`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchPrestataires = async () => {
  try {
    const response = await fetch(`${URL_USERS}/prestataires`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchUserById = async (userId, userType) => {
  try {
    const response = await fetch(`${URL_USERS}/${userId}/${userType}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const validatePrestataire = async (userId) => {
  try {
    const response = await fetch(`${URL_USERS}/verifyValidationPresta`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to validate prestataire");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error validating prestataire:", error);
    throw error;
  }
};

export const changeUserStatus = async (userId, userType, status) => {
  try {
    const response = await fetch(
      `${URL_USERS}/${userId}/${userType}/${status}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const createUser = (userData) => {
  return new Promise((resolve, reject) => {
    fetch(`${URL_ENVOI_MAIL}/sendCode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (response.status === 204 || response.status === 200) {
          resolve({});
        } else if (response.status === 409) {
          reject("EmailDuplicate");
        } else if (response.status === 403) {
          reject("UserBanned");
        } else {
          // Handle other response statuses here if needed
          reject("UnknownError");
        }
      })
      .catch((error) => {
        // Handle network errors or other exceptions
        console.error("Error creating user:", error);
        reject("UnknownError");
      });
  });
};

export const deleteUser = async (userId, userType) => {
  try {
    const response = await fetch(`${URL_USERS}/${userType}/${userId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const updateUser = async (userId, userType, userData) => {
  try {
    const response = await fetch(`${URL_USERS}/${userId}/${userType}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const banUser = async (userId, userType, userData) => {
  try {
    const response = await fetch(
      `${URL_USERS}/bannir/ausecours/${userId}/${userType}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchBannedUsers = async () => {
  try {
    const response = await fetch(`${URL_USERS}/bannis`); // Assuming you have an API endpoint for fetching banned users
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch banned users");
  }
};

export const unbanUser = async (userId) => {
  try {
    const response = await fetch(`${URL_USERS}/${userId}/debannis`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to unban user");
    }
  } catch (error) {
    console.error("Error unbanning user:", error);
  }
};

export const verifConfCode = async (code) => {
  try {
    const response = await fetch(`${URL_USERS}/code/${code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      throw new Error("TableTempIntrouvable");
    }

    if (response.status === 409) {
      throw new Error("Email already exists");
    }

    if (response.status === 403) {
      throw new Error("User is banned");
    }

    // Handle success cases
    if (response.status === 204 || response.status === 200) {
      return {};
    }

    // If none of the above conditions are met, throw an error
    throw new Error("Unknown error occurred");
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password, type) => {
  console.log("login", email, password, type);
  try {
    const response = await fetch(`${URL_AUTH}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, type }),
      credentials: "include", // Include cookies in the request
    });

    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    if (response.status === 403) {
      throw new Error("WrongPWD");
    }

    if (response.status === 409) {
      throw new Error("UserBanned");
    }

    if (response.status === 200) {
      return response;
    }

    throw new Error("Unknown error occurred");
  } catch (error) {
    throw error;
  }
};

export const updateCookie = async (userId, userType, userData) => {
  try {
    const response = await fetch(`${URL_AUTH}/updateCookie`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userType, userData }),
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating cookie:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

// GESTION DES ANNONCES

export const fetchAnnonce = async () => {
  try {
    const response = await fetch(URL_ANNONCE);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteAnnonce = async (annonceId) => {
  console.log("func :", annonceId);
  console.log("BACK_URL :", `${URL_ANNONCE}/${annonceId}`);
  try {
    const response = await fetch(`${URL_ANNONCE}/${annonceId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete annonce");
    }
  } catch (error) {
    console.error("Error deleting annonce:", error);
  }
};

export const createAnnonce = async (annonceData) => {
  try {
    const formData = new FormData();

    // Append each file in the pictures array
    if (annonceData.pictures && Array.isArray(annonceData.pictures)) {
      annonceData.pictures.forEach((file, index) => {
        formData.append(`pictures`, file);
      });
    }

    // Append all other form values
    for (let key in annonceData) {
      if (key !== "pictures") {
        formData.append(key, annonceData[key]);
      }
    }

    console.log("annonceData :", annonceData);

    const response = await fetch(URL_ANNONCE, {
      method: "POST",
      body: annonceData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error creating annonce:", error);
  }
};


export const fetchAnnonceById = async (annonceId) => {
  try {
    console.log("fetchAnnonceById", annonceId);
    const response = await fetch(`${URL_ANNONCE}/${annonceId}`);
    const data = await response.json();
    console.log("result = ", data);
    return data;
  } catch (error) {
    console.log("nope");
    console.log(error);
  }
};

export const fetchAnnonceFiltered = async (filter) => {
  try {
    console.log("fetchAnnonceFiltered", filter);
    const response = await fetch(`${URL_ANNONCE}/filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filter),
    });
    const data = await response.json();
    console.log("result = ", data);
    return data;
  } catch (error) {
    console.log("nope");
    console.log(error);
  }
};

export const updateAnnonce = async (annonceId, annonceData, files) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("cheminImg", file);
    });
    for (let key in annonceData) {
      if (key !== "cheminImg") {
        formData.append(key, annonceData[key]);
      }
    }
    const response = await fetch(`${URL_ANNONCE}/${annonceId}`, {
      method: "PUT",
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};


export const fetchAnnonceByBailleur = async () => {
  try {
    const response = await fetch(`${BASE_URL}/biens`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchBienDispo = async (defaultFilters) => {
  try {
    const response = await fetch(`${BACK_URL}/api/bienDispo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(defaultFilters),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};


export const fetchBienReserve = async () => {
  try {
    const response = await fetch(`${BASE_URL}/getBienReserve`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

// GESTION DES PAIEMENTS

export const fetchPaiement = async () => {
  try {
    const response = await fetch(URL_PAIEMENT);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const deletePaiement = async (paiementId) => {
  try {
    const response = await fetch(`${URL_PAIEMENT}/${paiementId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete paiement");
    }
  } catch (error) {
    console.error("Error deleting paiement:", error);
  }
};

export const validatePaiement = async (paiementId) => {
  try {
    const response = await fetch(`${URL_PAIEMENT}/${paiementId}/validate`, {
      method: "PUT",
    });
    if (!response.ok) {
      throw new Error("Failed to validate paiement");
    }
  } catch (error) {
    console.error("Error validating paiement:", error);
  }
};

export const createPaiement = async (paiementData) => {
  try {
    const response = await fetch(URL_PAIEMENT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paiementData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updatePaiement = async (paiementId, paiementData) => {
  try {
    const response = await fetch(`${URL_PAIEMENT}/${paiementId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paiementData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// GESTION DES RESERVATIONS

export const fetchReservation = async () => {
  try {
    const response = await fetch(URL_RESERVATION);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteReservation = async (reservationId) => {
  console.log("func :", reservationId);
  console.log("BACK_URL :", `${URL_RESERVATION}/${reservationId}`);
  try {
    const response = await fetch(`${URL_RESERVATION}/${reservationId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete reservation");
    }
  } catch (error) {
    console.error("Error deleting reservation:", error);
  }
};

export const updateReservation = async (reservationId, reservationData) => {
  try {
    const response = await fetch(`${URL_RESERVATION}/${reservationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    console.log(`${URL_RESERVATION}/${reservationId}`);
  }
};

export const fetchReservationByBailleur = async () => {
  console.log("Callin fetchReservationByBailleur");
  try {
    const response = await fetch(`${BASE_URL}/MyCalendar`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchReservationById = async (reservationId) => {
  try {
    console.log("fetchReservationById", reservationId);
    const response = await fetch(`${URL_RESERVATION}/${reservationId}`);
    const data = await response.json();
    console.log("result = ", data);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchReservationByIdVoyageur = async (voyageurId) => {
  try {
    console.log("fetchReservationByIdVoyageur", voyageurId);
    const response = await fetch(`${URL_RESERVATION}/${voyageurId}/voyageur`);
    const data = await response.json();
    console.log("result = ", data);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchDisabledDates = async (reservationId) => {
  try {
    console.log("fetchDisabledDates", reservationId);
    const response = await fetch(`${URL_RESERVATION}/${reservationId}/dates`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const createReservation = async (reservationData) => {
  console.log("createReservation avec :", reservationData);
  try {
    const response = await fetch(URL_RESERVATION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};


export const fetchEtatDesLieux = async () => {
  try {
    const response = await fetch(`${BASE_URL}/EtatDesLieux`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

export const createEtatDesLieux = async (etatDesLieuxData) => {
  try {
    const response = await fetch(`${BASE_URL}/createEtatDesLieux`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(etatDesLieuxData),
      credentials: "include", 
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error creating etat des lieux');
    }

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const UpdateEtatDesLieux = async (etatDesLieuxData) => {
  console.log("UpdateEtatDesLieux avec :", etatDesLieuxData);
  try {
    const response = await fetch(`${BASE_URL}/updateEtatDesLieux`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(etatDesLieuxData),
      credentials: "include", 
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error updating etat des lieux');
    }

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GESTION DES PRESTATIONS

export const fetchPrestationsById = async () => {
  try {
    const response = await fetch(`${BASE_URL}/prestationsById`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const createPrestation = async (prestationData) => {
  try {
    const response = await fetch(`${BASE_URL}/createPrestation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prestationData),
      credentials: "include", // Include credentials in the request
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchPrestationsEnAttente = async () => {
  try {
    const response = await fetch(`${BASE_URL}/prestationsEnAttente`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const acceptPrestation = async (prestationId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/acceptPrestation/${prestationId}`,
      {
        method: "PUT",
        credentials: "include",
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const deletePrestation = async (prestationId) => {
  try {
    const response = await fetch(`${BASE_URL}/prestation/${prestationId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchPrestationByPrestationId = async (prestationId) => {
  try {
    const response = await fetch(`${BASE_URL}/prestationsByIdPrestation?idPrestation=${prestationId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching prestation:', error);
    throw error;
  }
};

export const archiverPresta = async (prestationId) => {
  try {
    const response = await fetch(`${BASE_URL}/archiverPrestation/${prestationId}`, {
      method: "PUT",
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// GESTION DES AVIS

export const uploadAvis = async (id_BienImmobilier, id_Prestataire, typeIntervention, note, commentaire, id_Prestation) => {
  try {
    const response = await fetch(`${BASE_URL}/upload/avis/${id_Prestation}/${id_Prestataire}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id_BienImmobilier, id_Prestataire, typeIntervention, note, commentaire, id_Prestation }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading avis:', error);
    throw error;
  }
}

export const fetchAvis = async (prestationId, prestataireId) => {
  try {
    const response = await fetch(`${BASE_URL}/avis/${prestationId}/${prestataireId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch avis");
    }

    // Check if the response body is not empty
    const text = await response.text();
    if (!text) {
      throw new Error("Empty response body");
    }

    // Parse the JSON response
    const data = JSON.parse(text);
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching avis:", error);
    throw error;
  }
};


export const fetchEvaluationsByPrestataire = async (prestataireId) => {
  console.log("Calling fetchEvaluationsByPrestataire");
  try {
    const response = await fetch(`${BASE_URL}/evaluations/avis/${prestataireId}`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchGeneralInfoByPrestataire = async (prestataireId) => {
  console.log("Calling fetchGeneralInfoByPrestataire");
  try {
    const response = await fetch(`${BASE_URL}/avis/general/${prestataireId}`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// GESTION DES SERVICES EXTERNES

export const getCredentials = async () => {
  console.log("getCredentials");
  try {
    const response = await fetch(`${URL_AUTH}/me`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const createFirstMessage = async (messageData) => {
  try {
    const response = await fetch(`${BASE_URL}/createFirstMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchMessagesById = async () => {
  try {
    const response = await fetch(`${BASE_URL}/messagesById`, {
      credentials: "include", // or 'same-origin'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchDiscussions = async () => {
  try {
    const response = await fetch(`${BASE_URL}/discussionsOfUser`, {
      credentials: "include", // or 'same-origin'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchMessagesOfDiscussionById = async ({ id_receiver, type_receiver }) => { // Accept object as parameter
  try {
    const response = await fetch(`${BASE_URL}/messagesOfDiscussionById`, {
      method: 'POST', 
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_receiver, type_receiver }), 
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}


export const createRoomName = (user1, user2) => {
  // Initialize all categories to '00'
  let voyageur = "00";
  let bailleur = "00";
  let prestataire = "00";

  // Assign the user IDs to the correct categories
  if (user1.type === "voyageurs") voyageur = user1.id;
  else if (user1.type === "clientsBailleurs")
    bailleur = user1.id; // Corrected type
  else if (user1.type === "prestataires") prestataire = user1.id;

  if (user2.type === "voyageurs") voyageur = user2.id;
  else if (user2.type === "clientsBailleurs")
    bailleur = user2.id; // Corrected type
  else if (user2.type === "prestataires") prestataire = user2.id;

  // Return the room name
  return `room n°${voyageur}_${bailleur}_${prestataire}`;

};

export const storeMessage = async (messageData) => {
  try {
    const response = await fetch(`${BASE_URL}/storeMessage`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}


export const createFinance = async (financeData) => {
  try {
    const response = await fetch(`${BASE_URL}/createFinance`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(financeData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

export const fetchFinanceByUserId = async () => {
  try {
    const response = await fetch(`${BASE_URL}/financesByUserId`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}


// PARTIE STRIPE 

// services.js
export const createAbonnementSession = async (typeAbonnement, userId) => {
  const response = await fetch(`${URL_ABONNEMENT}/create-abonnement-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ typeAbonnement, userId })
  });

  if (response.ok) {
    const session = await response.json();
    window.location.href = session.url;
  } else {
    console.error('Failed to create checkout session');
  }
};

export const insertAbonnementInfos = async (typeAbonnement, userId, userType, price) => {
  const response = await fetch(`${URL_ABONNEMENT}/insert-abonnement-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ typeAbonnement, userId, userType, price })
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    console.error('Failed to insert abonnement info');
  }
};

export const checkAbonnement = async (userId) => {
  const response = await fetch(`${URL_ABONNEMENT}/check-abonnement?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    console.error('Failed to fetch abonnement info');
    throw new Error('Failed to fetch abonnement info');
  }
};

// GESTION DES SIGNALEMENTS

export const createSignalements = async (sujet) => {
  try {
    const response = await fetch(`${BASE_URL}/signalement`, {
      credentials: "include",
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sujet }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
