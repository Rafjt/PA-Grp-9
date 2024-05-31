// Define functions for backend calls
import { URL_USERS,URL_ANNONCE } from "./services.js";

export const fetchNombreUsers = async (type) => {
  try {
    const response = await fetch(`${URL_USERS}/count/${type}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchAgeMoyenUsers = async () => {
  try {
    const response = await fetch(`${URL_USERS}/mean-age`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching mean age:", error);
    throw error;
  }
};

export const fetchNombreAnnonces = async () => {
  try {
    const response = await fetch(`${URL_ANNONCE}/count`);
    const data = await response.json();
    return data;
  } catch(error) {
    console.log("Error fetching nombre d'annonces", error);
    throw error;
  }
};

export const fetchPrixAnnonce = async () => {
  try{
    const response = await fetch(`${URL_ANNONCE}/prixMoy`);
    const data = response.json();
    return data;
  } catch(error) {
    console.log("impossible de fetch le prix moyen", error)
    throw error;
  }
}
