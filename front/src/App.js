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

function App() {
  return (
      <div className="Page">
        <div className="header">
          <Header />
        </div>
        <div className="app">
          <Routes>
            <Route path="/backoffice" element={<BackOffice />} />
            <Route path="/" element={<Acceuil />} />
            <Route path="/login" element={<Login />} />
            <Route path="/update/:id/:type" element={<Update />} />
            <Route path="/update/:id/bien" element={<UpdateAnnonce />} />
            <Route
              path="/gestionUtilisateur"
              element={<GestionUtilisateur />}
            />
            <Route
              path="/gestionReservations"
              element={<GestionReservations />}
            />
            <Route path="/update/:id/reservation" element={<UpdateReservation />} />

            <Route path="/gestionAnnonce" element={<GestionAnnonce />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/Biens" element={<PageBien />} />
            <Route path="/mailConfirm" element={<MailConfirm />} />
            <Route path="/gestionPaiement" element={<GestionPaiement/>} />
            <Route path="/viewBien/:id" element={<ViewBien />} />
          </Routes>
        </div>
        <div className="footer">
          <Footer />
        </div>
      </div>
  );
}

export default App;
