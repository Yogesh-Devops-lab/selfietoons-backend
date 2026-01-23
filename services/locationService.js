import axios from 'axios';

const API_BASE_URL = 'https://api.countrystatecity.in/v1';
const API_KEY = process.env.COUNTRY_STATE_CITY_API_KEY; // Store API Key in .env

const headers = {
  'X-CSCAPI-KEY': API_KEY,
};

// Get all States of India
export const getStatesOfIndia = async () => {
  const response = await axios.get(`${API_BASE_URL}/countries/IN/states`, { headers });
  return response.data;
};

// Get Districts (Cities) by State ISO Code (e.g., TN for Tamil Nadu)
export const getDistrictsByStateCode = async (stateCode) => {
  const response = await axios.get(`${API_BASE_URL}/countries/IN/states/${stateCode}/cities`, { headers });
  return response.data;
};
