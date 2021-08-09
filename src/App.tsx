import React, { useState } from "react";
// import withFirebaseAuth from 'react-with-firebase-auth'
// import { useAuthState } from 'react-firebase-hooks/auth';

import Swap from "./structure/AMM/Swap";
// import { db, firebaseAppAuth, functions, storage } from "./firebase";
import { colors } from "./common/Formatting";
import "./App.css";

export default function App() {
  // const [user] = useAuthState(firebaseAppAuth);

  return (
    <div
      className="App"
      style={{
        backgroundColor: colors.background,
      }}
    >
      <header className="App-header">
        <Swap />
      </header>
    </div>
  );
}
