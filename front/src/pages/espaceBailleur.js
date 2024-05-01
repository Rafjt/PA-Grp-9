import React, { useEffect } from "react";
import Cookies from 'js-cookie';

console.log(Cookies.get('admin')); // replace 'admin' with the name of your cookie
console.log(Cookies.get('id')); // replace 'id' with the name of your cookie
console.log(Cookies.get('type')); // replace 'type' with the name of your cookie

function EspaceBailleur() {
    console.log(document.cookie);
    useEffect(() => {
        fetch('http://localhost:3001/api/biens', { credentials: 'include' }) // include credentials
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        });
    }, []);

    return (
        <div>
            <h1>Espace Bailleur</h1>
        </div>
    );
}

export default EspaceBailleur;