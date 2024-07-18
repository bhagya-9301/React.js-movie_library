import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email_id: '',
        contact_number: '',
        password: '',
        confirm_password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
        alert('Passwords do not match');
        return;
    }

    axios.post('http://localhost:5000/register', formData)
        .then(response => {
            if (response.status === 200) {
                alert('Registration successful'); 
                navigate('/login'); 
            }
        })
        .catch(error => {
            console.error('There was an error!', error);
            alert('Registration failed'); 
        });
};
    return (
        <form onSubmit={handleSubmit} className='rform'>
            <h2 className='rh2'>Register</h2>
            <div>
                <label>Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div>
                <label>Email</label>
                <input type="email" name="email_id" value={formData.email_id} onChange={handleChange} required />
            </div>
            <div>
                <label>Contact Number</label>
                <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} required />
            </div>
            <div>
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div>
                <label>Confirm Password</label>
                <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required />
            </div>
            <button type="submit">Register</button>
            <p><Link to='/'>Already registered? Login here</Link></p>
        </form>
    );
};

export default Register;
