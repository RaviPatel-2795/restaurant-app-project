/* eslint-disable react-hooks/exhaustive-deps */
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

import './App.css'
import axios from 'axios';
import { useState, useEffect } from 'react';
import MenuItemsTable from './components/MenuItemsTable/MenuItemsTable';

function App() {

  const apiEndpoint = 'https://demjsaclkk.execute-api.us-east-1.amazonaws.com/restaurant-app-get-items';

  const restaurantId = window.location.pathname.replace('/','');

  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState("false");

  const getRestaurantMenu = async () => {
    return await axios
      .get(apiEndpoint, { params:  { id: restaurantId } })
      .then((res) => {
        const cleansedData = res.data.flat(Infinity);
        setRows(cleansedData) 
        setLoaded("true");
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getRestaurantMenu();
  }, []);

  if (loaded === "false") {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div className="card">
          <h1>Restaurant { restaurantId } Menu</h1>
          <span className="loader"></span>
          <p style={{ marginTop: "0.15rem" }}>Loading...</p>
        </div>
      </ThemeProvider>
    )
  } else {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div className="card">
          <h1>Restaurant { restaurantId } Menu</h1>
          <div className="menu-container">
            {rows.length > 0 ? 
            <MenuItemsTable rows={rows} /> 
            :
            <div>
              <p>No items/ Invalid Restaurant</p>
              <p>(Hint: Only 2 restaurants exist at URLs: <a href='/123'>/123</a> & <a href='/456'>/456</a>)</p>
            </div>
            }
          </div>
        </div>
      </ThemeProvider>
    )
  }
}

export default App
