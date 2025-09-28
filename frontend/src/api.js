// api.js
import axios from 'axios';

// Use CRA proxy in dev. For production, set REACT_APP_API_BASE.
//const baseURL = process.env.REACT_APP_API_BASE || '';
const baseURL = 'https://flowhub-2wbr.onrender.com' || '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
