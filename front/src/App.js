import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header.js';
import BackOffice from './backOffice.js'; 
import Footer from './components/footer.js';
import GestionUtilisateur from './gestionUtilisateur.js';
import './App.css';
import Acceuil from './pages/acceuil.js';
import Login from './pages/login';

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
          <Route path="/home" element={<Acceuil />} />
          <Route path="/login" element={<Login />} />
          <Route path="/gestionUtilisateur" element={<GestionUtilisateur />} />
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