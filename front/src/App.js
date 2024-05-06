import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header.js";
import BackOffice from "./pages/backOffice.js";
import Footer from "./components/footer.js";
import GestionUtilisateur from "./pages/gestionUtilisateur.js";
import "./App.css";
import Acceuil from "./pages/acceuil.js";
import Login from "./pages/login";
import Signup from "./pages/signup.js";
import Update from "./pages/update.js";
import UpdateAnnonce from "./pages/updateAnnonce.js";
import GestionAnnonce from "./pages/gestionAnnonce.js";
import GestionReservations from "./pages/gestionReservations.js";
import UpdateReservation from "./pages/updateReservation.js";
import Statistiques from "./pages/statistiques.js";
import PageBien from "./pages/pageBien.js";
import MailConfirm from "./pages/mailConfirm.js";
import GestionPaiement from "./pages/gestionPaiement.js";
import ViewBien from "./pages/viewBien.js";
import EspaceBailleur from "./pages/espaceBailleur.js";
import UserProfile from "./pages/userProfile.js";
import MesBiens from "./pages/mesBiens.js";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { getCredentials } from "./services.js";
import { useState } from "react";
import ModifyBien from "./pages/modifyBien.js";
import CalendarBailleurs from "./pages/calendarBailleurs.js";
import ReserverBien from "./pages/reserverBien.js";
import PagePaiement from "./pages/pagePaiement.js";
import EspaceVoyageur from "./pages/espaceVoyageur.js";
import CreeBien from "./pages/creeBien.js";
// import { use } from "../../back/routes/auth.js";

function ProtectedRoute({ component: Component }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    getCredentials().then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Replace this with your loading indicator
  }

  const isAdmin = user && user.admin === 1;

  return isAdmin ? (
    <Component />
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
}

function ProtectedAuthRoute({ component: Component, authType }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    getCredentials().then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Replace this with your loading indicator
  }

  let isAuthenticated = false;

  if (user) {
    switch (authType) {
      case "admin":
        isAuthenticated = user.admin === 1;
        break;
      case "prestataires":
        isAuthenticated = user.type === "prestataires";
        break;
      case "voyageurs":
        isAuthenticated = user.type === "voyageurs";
        break;
      case "clientsBailleurs":
        isAuthenticated = user.type === "clientsBailleurs";
        break;
      case "all": // New case for "all" authentication type
        isAuthenticated = true;
        break;
      default:
        isAuthenticated = false;
    }
  }


  return isAuthenticated ? (
    <Component />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

function App() {

  useEffect(() => {
    getCredentials().then(data => {
      console.log(data);
    });
  });

  return (
    <div className="Page">
      <div className="header">
        <Header />
      </div>
      <div className="app">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Acceuil />} />
          <Route path="/login" element={<Login />} />
          <Route path="/viewBien/:id" element={<ViewBien />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/Biens" element={<PageBien />} />
          <Route path="/mailConfirm" element={<MailConfirm />} />

          {/* Routes Authent ALL*/}
          <Route path="/userProfile" element={ <ProtectedAuthRoute path="/userProfile" component={UserProfile} authType="all"/>} />
          <Route path="/pagePaiement" element={ <ProtectedAuthRoute path="/pagePaiement" component={PagePaiement} authType="all"/>} />
          {/* Routes Authent Voyageur*/}
          <Route path="/Reservation" element={<ProtectedAuthRoute path="/reserverBien" component={ReserverBien} authType="voyageurs" />} />
          <Route path="/EspaceVoyageur" element={<ProtectedAuthRoute path="/espaceVoyageur" component={EspaceVoyageur} authType="voyageurs" />} />
          {/* Routes Authent CLientsBailleurs*/}
          <Route path="/espaceBailleur" element={<ProtectedAuthRoute path="/espaceBailleur" component={EspaceBailleur} authType="clientsBailleurs" />} />
          <Route path="/mesBiens" element={<ProtectedAuthRoute path="/mesBiens" component={MesBiens} authType="clientsBailleurs" />} />
          <Route path="/modifyBien" element={<ProtectedAuthRoute path="/modifyBien" component={ModifyBien} authType="clientsBailleurs" />} />
          <Route path="/calendarBailleurs" element={<ProtectedAuthRoute path="/calendarBailleurs" component={CalendarBailleurs} authType="clientsBailleurs" />} />
          <Route path="/creeBien" element={<ProtectedAuthRoute path="/creeBien" component={CreeBien} authType="clientsBailleurs" />} />
          {/* Routes Authent Prestataires*/}

          {/* Routes admin */}
          <Route path="/backOffice" element={<ProtectedRoute component={BackOffice} />} />
          <Route path="/update/:id/:type" element={<ProtectedRoute component={Update} />} />
          <Route path="/gestionUtilisateur" element={<ProtectedRoute component={GestionUtilisateur} />} />
          <Route path="/gestionReservations" element={<ProtectedRoute component={GestionReservations} />} />
          <Route path="/update/:id/reservation" element={<ProtectedRoute component={UpdateReservation} />} />
          <Route path="/gestionAnnonce" element={<ProtectedRoute component={GestionAnnonce} />} />
          <Route path="/statistiques" element={<ProtectedRoute component={Statistiques} />} />
          <Route path="/gestionPaiement" element={<ProtectedRoute component={GestionPaiement} />} />
          <Route path="/update/:id/bien" element={<ProtectedRoute component={UpdateAnnonce} />} />
        </Routes>
      </div>
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
}

export default App;
