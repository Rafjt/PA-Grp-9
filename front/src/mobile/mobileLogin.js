import React, { useState, useEffect } from "react";
import axios from 'axios';
import { URL_AUTH } from '../services'

const MobileLogin = () => {
    const [credentials, setCredentials] = useState({});
    const [response, setResponse] = useState(null);

    useEffect(() => {
        // Function to handle the custom event
        const handleCredentialsEvent = async (event) => {
            const receivedCredentials = JSON.parse(event.detail); // Parse JSON string to object
            setCredentials(receivedCredentials);

            try {
                // Send the received credentials to the login endpoint
                console.log('Sending credentials to the login endpoint');
                const loginResponse = await axios.post(`${URL_AUTH}/login`, receivedCredentials);
                setResponse(loginResponse.data);

                // Send the response back to the mobile app
                window.dispatchEvent(new CustomEvent('loginResponse', { detail: loginResponse.data }));
            } catch (error) {
                console.error('Login failed', error);
                window.dispatchEvent(new CustomEvent('loginResponse', { detail: { error: 'Login failed' } }));
            }
        };

        // Add event listener for the custom event
        window.addEventListener('credentialsEvent', handleCredentialsEvent);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('credentialsEvent', handleCredentialsEvent);
        };
    }, []);

    return (
        <div>
            <h1>Mobile Login</h1>
            {/* Display the credentials */}
            <pre>{JSON.stringify(credentials, null, 2)}</pre>
            {/* Display the response */}
            <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
    );
}

export default MobileLogin;
