import React, { useEffect, useState } from 'react';
  
  /**
   * Specific Redirect URL backend API 
   * Only for Spotify Authentication Code workflow
   */
  export const getSpotifyAuthCode = async () => {
    try {
      window.open( "http://127.0.0.1:5000/start_login");

    } catch (error) {
      console.error("SpotifyAuthenCode error: ", error);
      throw error;
    }
  };

  /**
   * Generic GET request
   * @param {string} url - API endpoint
   * @returns {Promise<string|null>} - response JSON or null if redirected
   */
  export const getData = (url) => {
    return fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log("after json parse:", data, data.access_token);

      return data.access_token;
    }).catch(error => {
      throw new Error(`GET failed: ${error}`);      
    });
  };
  
  /**
   * Generic POST request
   * @param {string} url - API endpoint
   * @param {object} payload - JSON data to send
   * @returns {Promise<any|null>} - response JSON or null if redirected
   */
  export const postData = async (url, payload) => {
    console.log("payload", payload);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then(res => res.json())
    .then(data => {
      return data
    })
    .catch(error => {
      console.error('POST error:', error);
      throw error;
    });
  };
  