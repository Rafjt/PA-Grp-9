import "bootstrap/dist/css/bootstrap.min.css";
import "./signup.css";
import { useState } from "react";

const Signup = () => {

    // useState= undefined; 

    // const [users, setUsers] = useState({
    //     voyageurs: [],
    //     clientsbailleurs: [],
    //     prestataires: [],
    // });


    // const [form, setForm] = useState({
    //     nom: '',
    //     prenom: '',
    //     adresseMail: '', // Updated property name
    //     motDePasse: '', // Updated property name
    //     admin: '0',
    //     type: 'VOYAGEURS',
    // });
    

    //     const handleChange = (e) => {
    //         setForm({
    //             ...form,
    //             [e.target.name]: e.target.value,
    //         });
    //     };



    //     const handleSubmit = async (e) => {
    //         e.preventDefault();
    
    //         const response = await fetch('http://localhost:3001/api/users', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(form),
    //         });
    
    //         const data = await response.json();
    //         console.log(data);
    //     };


    // const [searchTerm, setSearchTerm] = useState('');

    // const idFields = {
    //     voyageurs: 'id',
    //     clientsbailleurs: 'id',
    //     prestataires: 'id',
    // };

    // useEffect(() => {
    //     fetch('http://localhost:3001/api/users')
    //         .then((response) => response.json())
    //         .then((data) => {
    //             console.log('here:', data);
    //             setUsers(data);
    //         })
    //         .catch((error) => console.log(error));
    // }, []);

    // const handleDelete = (userId, userType) => {
    //     fetch(`http://localhost:3001/api/users/${userType}/${userId}`, { method: 'DELETE' })
    //     .then((response) => {
    //         if (response.ok) {
    //             // Delete operation successful, update the state to reflect changes
    //             setUsers((prevUsers) => ({
    //                 ...prevUsers,
    //                 [userType]: prevUsers[userType].filter((user) => user[idFields[userType]] !== userId),
    //             }));
    //         } else {
    //             throw new Error('Failed to delete user');
    //         }
    //     })
    //     .catch((error) => console.error('Error deleting user:', error));
    // };

    // const handleModify = (userId) => {};



    // const handleSearch = (event) => {
    //     setSearchTerm(event.target.value);
    // };

  function showPassword() {
    var x = document.getElementById("mdp");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  function showPasswordConfirm() {
    var x = document.getElementById("mdp2");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  return (
    <div class="container-fluid mt-5 mr-0 ml-0 w-100">
      <div class="row">
        <div class="col">
          <div class="margin mt-2 fs-2 mb-2">
            <h5>
              <b>Formulaire d'inscription</b>
            </h5>
          </div>
        </div>
      </div>
      <form>
        <input class="input" type="text" placeholder="Nom" />
        <input class="input" type="text" placeholder="Prénom" />
        <input class="input" type="date" placeholder="Date de naissance" />
        <input class="input" type="email" placeholder="Adresse email" />
        <div>
          <div>
            <input
              id="mdp"
              class="input mt-3"
              type="password"
              placeholder="Mot de passe"
            />
            <br />
            <label class="position-relative d-inline-block text-center showpwd">
              <input type="checkbox" class="ntm" onClick={showPassword} />{" "}
              Afficher
            </label>
          </div>
          <div>
            <input
              id="mdp2"
              class="input mt-3"
              type="password"
              placeholder="Confirmer le mot de passe"
            />
            <br />
            <label class="position-relative d-inline-block text-center showpwd">
              <input type="checkbox" onClick={showPasswordConfirm} /> Afficher
            </label>
          </div>
        </div>

        <br></br>
        <button type="submit" class="btn btn-dark btn-lg mt-4">
          Créer un compte
        </button>
      </form>
    </div>
  );
};

export default Signup;
