import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './config/firebase-config';
import { ProviderId } from 'firebase/auth';
import { doc, setDoc} from 'firebase/firestore';
import LandingPage from './components/LandingPage';
import AccountPage from './components/AccountPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);

  return (
      <Router>
        <Routes>
          <Route path='' element={<LandingPage />}></Route>
          <Route path='/account' element={<AccountPage />}></Route>
        </Routes>
      </Router>
);
}

export default App;
