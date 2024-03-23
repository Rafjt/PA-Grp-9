import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header.js';
import BackOffice from './pages/backOffice.js'; 
import Footer from './components/footer.js';
import GestionUtilisateur from './pages/gestionUtilisateur.js';
import './App.css';
import Acceuil from './pages/acceuil.js';
import Login from './pages/login';
import Signup from './pages/signup.js';

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
          <Route path="/gestionUtilisateur" element={<GestionUtilisateur />}/>
          <Route path="/signup" element={<Signup />} />
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