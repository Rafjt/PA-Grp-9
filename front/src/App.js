import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header.js';
import BackOffice from './pages/backOffice.js'; 
import Footer from './components/footer.js';
import GestionUtilisateur from './pages/gestionUtilisateur.js';
import Acceuil from './pages/acceuil.js';
import Login from './pages/login';
import Signup from './pages/signup.js';
import Update from './pages/update.js';
import UpdateAnnonce from './pages/updateAnnonce.js';
import GestionAnnonce from './pages/gestionAnnonce.js';
import GestionReservations from './pages/gestionReservations.js';
import GestionPaiement from './pages/gestionPaiement.js';
import MailConfirm from './pages/mailConfirm.js';
import PageBien from './pages/pageBien.js';


function App() {
  return (
    <Router>
      <div className='Page'>
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
          <Route path="/gestionUtilisateur" element={<GestionUtilisateur />}/>
          <Route path="/gestionReservations" element={<GestionReservations />} />
          <Route path="/gestionAnnonce" element={<GestionAnnonce />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/gestionPaiement" element={<GestionPaiement />} />
          <Route path="/mailConfirm" element={<MailConfirm />} />
          <Route path="/Biens" element={<PageBien />} />
        </Routes>
        </div>
        <div className="footer">
          <Footer/>
        </div>
      </div>
    </Router>
  );
}

export default App;