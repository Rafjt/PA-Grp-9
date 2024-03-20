import './App.css';
import React from 'react';
import Header from './components/header.js';
import BackOffice from './backOffice.js'; 
import Footer from './components/footer.js';
import './App.css';
import Acceuil from './pages/acceuil.js';

function App() {
  return (
    <div className='Page'>
      <div className="header">
        <Header />
      </div>
      <div className="app">
        <Acceuil /> {/* use BackOffice */}
      </div>
      <div className="footer">
      <Footer/>
      </div>
    </div>
  );
}

export default App;
