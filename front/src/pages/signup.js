import "bootstrap/dist/css/bootstrap.min.css";
import "./acceuil.css";

const Signup = () => {
  return (
    <div class="container-fluid mt-5 mr-0 ml-0 w-100">
      <div class="row">
        <div class="col">
          <div class="margin mt-2 fs-2 mb-2">
            <h6>
              <b>Formulaire d'inscription</b>
            </h6>
          </div>
        </div>
      </div>
      <form>
        <input type="text" placeholder="Nom" class="m-3" />
        <input type="text" placeholder="Prénom" class="m-3" />
        <input type="date" placeholder="Date de naissance" class="m-3" />
        <input type="email" placeholder="Adresse email" class="m-3" />
        <div>
          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              className="mt-3"
            />
            <br />
            <label class="showpwd">
              <input type="checkbox" class="ntm" /> Show Password
            </label>
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              className="mt-3"
            />
            <br />
            <label class="showpwd">
              <input type="checkbox" /> Show Password
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
