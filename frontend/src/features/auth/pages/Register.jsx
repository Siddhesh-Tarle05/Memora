import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.scss';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { setError } from '../auth.slice';

const Register = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    if (error) dispatch(setError(null));
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleRegister(formData);
    if (result && result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="register">
      <div className="register__bg register__bg--top"></div>
      <div className="register__bg register__bg--bottom"></div>

      <div className="register__container">
        <div className="register__card">
          <div className="register__header">
            <h1>Create Account</h1>
            <p>Join us and start your journey</p>
          </div>
          
          {error && <div className="error-message" style={{color: 'red', textAlign: 'center', marginBottom: '1rem'}}>{error}</div>}

          <form onSubmit={handleSubmit} className="register__form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hello@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="register__btn">
              Sign Up
            </button>
          </form>

          <p className="register__footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;