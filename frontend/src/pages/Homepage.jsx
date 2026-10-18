import React from 'react';
import Rightpage from './Rightpage';
import Upperbar from '../components/Upperbar';
import "./Homepage.css";
function Home() {
  return (
    <>
      <Upperbar />
      <div className="homepage">
        <div className="left-page">
          <h1>652</h1>
        </div>
        <div className="right-page">
          <Rightpage />
        </div>
      </div>
    </>
  );
}

export default Home;
