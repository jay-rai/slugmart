import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './config/firebase-config';
import { ProviderId } from 'firebase/auth';
import { doc, setDoc} from 'firebase/firestore';
import LandingPage from './components/LandingPage';
import AccountPage from './components/AccountPage';
import ListingsPage from './components/ListingsPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddListing from './components/AddListing';
import EditListing from './components/EditListing';

function App() {
  const [user, setUser] = useState(null);

  return (
      <Router>
        <Routes>
          <Route path='' element={<LandingPage />}></Route>
          <Route path='/account' element={<AccountPage />}></Route>
          <Route path='/browse' element={<ListingsPage />}></Route>
          <Route path='/view-listing' element={<ListingsPage />}></Route>
          <Route path='/add-listing' element={<AddListing />}></Route>
          <Route path='/edit-listing/:id' element={<EditListing />}></Route>
        </Routes>
      </Router>
);
}

export default App;
