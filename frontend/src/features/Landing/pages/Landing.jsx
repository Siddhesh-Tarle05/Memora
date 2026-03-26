import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spline from '@splinetool/react-spline';
import '../styles/Landing.scss';

const Landing = () => {
  const user = useSelector((state) => state.auth.user);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="logo">
           <div className="logo-icon">M</div>
           <p>Memora</p>
        </div>
        <div className="nav-links">
          <Link to="/login" className="login-link">Sign In</Link>
          <Link to="/register" className="register-btn">Get Started</Link>
        </div>
      </nav>

      <main className="landing-main">
         <div className="landing-spline-container">
          <Spline scene="https://prod.spline.design/SiyTe6cZWATxND6I/scene.splinecode" />
        </div>
        <div className="landing-content">
          <h1>Your Digital Second Brain</h1>
          <p>
            Capture, organize, and resurface your thoughts seamlessly.
            Experience a new way to interact with your memories.
          </p>
          <div className="cta-container">
            <Link to="/register" className="primary-cta">Start Free</Link>
          </div>
        </div>
       
      </main>
    </div>
  );
};

export default Landing;
