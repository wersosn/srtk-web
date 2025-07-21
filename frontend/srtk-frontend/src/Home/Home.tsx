import React from 'react';
import { Link } from 'react-router-dom';
import ReservationCalendar from "../Calendar/ReservationCalendar";

const Home = () => {
  return (
    <>
      <h2>Rezerwacje toru kolarskiego</h2>
      <hr />
      <ReservationCalendar />
    </>
  );
};

export default Home;