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

function ProtectedAuthRoute({ component: Component }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    getCredentials().then(data => {
      console.log(data); // Log the data to check if it's being fetched correctly
      setUser(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Replace this with your loading indicator
  }

  const isAuthenticated = user && user.type === "clientsBailleurs";

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

          {/* Routes Authent */}
          <Route path="/espaceBailleur" element={<ProtectedAuthRoute component={EspaceBailleur} />} />
          <Route path="/userProfile" element={<ProtectedAuthRoute component={UserProfile} />} />
          <Route path="/mesBiens" element={<ProtectedAuthRoute component={MesBiens} />} />
          <Route path="/update/:id/bien" element={<ProtectedAuthRoute component={UpdateAnnonce} />} />

          {/* Routes admin */}
          <Route path="/backOffice" element={<ProtectedRoute component={BackOffice} />} />
          <Route path="/update/:id/:type" element={<ProtectedRoute component={Update} />} />
          <Route path="/gestionUtilisateur" element={<ProtectedRoute component={GestionUtilisateur} />} />
          <Route path="/gestionReservations" element={<ProtectedRoute component={GestionReservations} />} />
          <Route path="/update/:id/reservation" element={<ProtectedRoute component={UpdateReservation} />} />
          <Route path="/gestionAnnonce" element={<ProtectedRoute component={GestionAnnonce} />} />
          <Route path="/statistiques" element={<ProtectedRoute component={Statistiques} />} />
          <Route path="/gestionPaiement" element={<ProtectedRoute component={GestionPaiement} />} />
        </Routes>
      </div>
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
}

export default App;
