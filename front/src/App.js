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
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const authentCookie = Cookies.get("connect.sid");
console.log("OGadminCookie:", authentCookie);

if (authentCookie !== undefined) {
  console.log("The admin cookie exists.");
} else {
  console.log("The admin cookie does not exist.");
}

function ProtectedRoute({ component: Component }) {
  const adminCookie = Cookies.get("admin");
  console.log("HERE adminCookie:", adminCookie);
  const isAdmin = adminCookie !== undefined && adminCookie !== "0";
  const location = useLocation();

  return isAdmin ? (
    <Component />
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
}

function ProtectedAuthRoute({ component: Component }) {
  const isAuthenticated = Cookies.get("connect.sid") !== undefined;
  const location = useLocation();

  return isAuthenticated ? (
    <Component />
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
}

function App() {
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

          {/* Routes admin */}
          <Route path="/backOffice" element={<ProtectedRoute component={BackOffice} />} />
          <Route path="/update/:id/:type" element={<ProtectedRoute component={Update} />} />
          <Route path="/update/:id/bien" element={<ProtectedRoute component={UpdateAnnonce} />} />
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
