// Define functions for backend calls
const BASE_URL = "http://localhost:3001/api";
const URL_USERS = `${BASE_URL}/users`;
export const BACK_URL = "http://localhost:3001";
const URL_ANNONCE = `${BASE_URL}/bienImo`;
const URL_PAIEMENT = `${BASE_URL}/paiement`;
const URL_ENVOI_MAIL = `${BASE_URL}/mail`;
const URL_RESERVATION = `${BASE_URL}/reservation`;

export const fetchUsers = async () => {
  try {
    const response = await fetch(URL_USERS);
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
      `${URL_USERS}/bannir/vatefaireenculer/${userId}/${userType}`,
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
  console.log("URL :", `${URL_ANNONCE}/${annonceId}`);
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
    formData.append("pictures", annonceData.pictures); // Append the file

    // Append all other form values
    for (let key in annonceData) {
      if (key !== "pictures") {
        // Exclude the file because it's already appended
        formData.append(key, annonceData[key]);
      }
    }

    console.log("annonceData-> p", annonceData.pictures);

    const response = await fetch(URL_ANNONCE, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("ici", error);
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

export const updateAnnonce = async (annonceId, annonceData, file) => {
  try {
    console.log("file", file);
    const formData = new FormData();
    formData.append("cheminImg", file);
    for (let key in annonceData) {
      if (key !== "cheminImg") {
        // Exclude the file because it's already appended
        formData.append(key, annonceData[key]);
        console.log("key", key, annonceData[key]);
        console.log("formData", formData);
      }
    }
    console.log("formData", formData);
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
  console.log("func :",reservationId);
  console.log("URL :",`${URL_RESERVATION}/${reservationId}`);
  try {
    const response = await fetch(
      `${URL_RESERVATION}/${reservationId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete reservation");
    }
  } catch (error) {
    console.error("Error deleting reservation:", error);
  }
}

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

// export const createReservation = async (reservationData) => {
//   try {
//     const response = await fetch(URL_RESERVATION, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(reservationData),
//     });
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };
