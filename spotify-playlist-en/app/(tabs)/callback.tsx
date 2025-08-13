import React, { useState, useRef, useEffect } from 'react';

const Callback: React.FC = () => {

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
  
    if (code) {
      // Send the code to your backend
      fetch("http://127.0.0.1:5000/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, state })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Access token response:", data);
        // You can now save access_token and use it to call Spotify API
      })
      .catch(err => console.error("Token exchange failed:", err));
    } else {
      console.error("No code found in redirect URL");
    }
  }, []);
  return (
    <div> A Template for my Authentication code callback page</div>
  );
};


export default Callback;
