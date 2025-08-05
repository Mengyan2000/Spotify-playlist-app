import React, { useEffect, useState } from 'react';

/**
 * Redirect handler
 * If response is redirected to a /callback URL, navigate the browser there.
 * Returns true if redirect occurred.
 */
const handleRedirectIfNeeded = (response) => {
    console.log("entering handleRedirectIfNeeded");
    if (response.redirected && response.url.includes('/callback')) {
        const url = new URL(response.url); // parse full URL
        const params = new URLSearchParams(url.search);
        console.log("params", params);

        const code = params.get('code');
        const state = params.get('state')

        if (code && state) {
            return {code, state};
        } else {
            console.error('Missing code or state in callback URL');
            return null;
        }
    }
    return null;
  };
  
  /**
   * Generic GET request
   * @param {string} url - API endpoint
   * @returns {Promise<object|null>} - response JSON or null if redirected
   */
  export const getData = async (url) => {
    try {
        const response = await fetch(url);
  
        const redirectData = handleRedirectIfNeeded(response);
        
        if (redirectData) {
            const { code, state } = redirectData;
            console.log("redirected with code: ", code, "and state: ", state);
            return { code, state };
        } else {
            if (!response.ok) throw new Error(`GET failed: ${response.status}`);
            return await response.json();
        }
    } catch (error) {
      console.error('GET error:', error);
      throw error;
    }
  };
  
  /**
   * Generic POST request
   * @param {string} url - API endpoint
   * @param {object} payload - JSON data to send
   * @returns {Promise<object|null>} - response JSON or null if redirected
   */
  export const postData = async (url, payload) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (handleRedirectIfNeeded(response)) return null;
  
      if (!response.ok) throw new Error(`POST failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('POST error:', error);
      throw error;
    }
  };
  