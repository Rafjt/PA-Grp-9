const BASE_URL = 'http://localhost:3001/api/users';
export const createUser = async (userData) => {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            throw new Error('Failed to create user');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await fetch(BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const deleteUser = async (userId, userType) => {
    try {
        const response = await fetch(`${BASE_URL}/${userType}/${userId}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
    
};