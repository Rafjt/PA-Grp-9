// Define functions for backend calls
const URL = 'http://localhost:3001/api/users';

export const fetchUsers = async () => {
    try {
      const response = await fetch(URL);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  
  export const createUser = async (userData) => {
    try {
      const response = await fetch(URL, {
        method: "POST",
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
  
  export const deleteUser = async (userId, userType) => {
    try {
      const response = await fetch(
        `${URL}/${userType}/${userId}`,
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
  