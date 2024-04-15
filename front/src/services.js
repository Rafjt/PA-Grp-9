// Define functions for backend calls
const URL_USERS = 'http://localhost:3001/api/users';
const URL_ANNONCE = 'http://localhost:3001/api/bienimo';

export const fetchUsers = async () => {
    try {
      const response = await fetch(URL_USERS);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  
  export const createUser = async (userData) => {
    try {
      const response = await fetch(URL_USERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
  
      if (response.status === 409) {
        throw new Error("Email already exists");
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      throw error; // Re-throw the error to be handled by the calling function
    }
  };
  
  export const deleteUser = async (userId, userType) => {
    try {
      const response = await fetch(
        `${URL_USERS}/${userType}/${userId}`,
        {
          method: "DELETE",
        }
      );
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

  // GESTION DES ANNONCES

  export const fetchAnnonce = async () => {
    try {
      const response = await fetch(URL_ANNONCE);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  export const deleteAnnonce = async (annonceId) => {
    console.log("func :",annonceId);
    console.log("URL :",`${URL_ANNONCE}/${annonceId}`);
    try {
      const response = await fetch(
        `${URL_ANNONCE}/${annonceId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete annonce");
      }
    } catch (error) {
      console.error("Error deleting annonce:", error);
    }
  }
  

  export const createAnnonce = async (annonceData) => {
    try {
      const response = await fetch(URL_ANNONCE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(annonceData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  export const fetchAnnonceById = async (annonceId) => {
    try {
      console.log('fetchAnnonceById', annonceId);
      const response = await fetch(`${URL_ANNONCE}/${annonceId}`);
      const data = await response.json();
      console.log('result = ', data);
      return data;
    } catch (error) {
      console.log("nope");
      console.log(error);
    }
  };

  export const updateAnnonce = async (annonceId, annonceData) => {
    try {
      const response = await fetch(`${URL_ANNONCE}/${annonceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(annonceData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  };