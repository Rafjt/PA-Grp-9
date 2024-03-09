import React from 'react';
import Header from './components/header.js';
import BackOffice from './backOffice.js'; 
import Footer from './footer.js';
import './App.css';

function App() {
  return (
    <div className='Page'>
      <div className="header">
        <Header />
      </div>
      <div className="app">
        <BackOffice /> {/* use BackOffice */}
      </div>
      <div className="footer">
      <Footer/>
      </div>
    </div>
  );
}

export default App;