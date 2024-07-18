import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await login(email, password);
            console.log("Login response userId:", response.userId);
            navigate('/home');
        } catch (error) {
            if (error.response) {
                setError(error.response.data || 'An error occurred. Please try again.');
            } else if (error.request) {
                setError('No response from server. Please try again later.');
            } else {
                setError('An error occurred. Please try again.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className='login'>
            <h2 className='lh2'>Login</h2>
            <div>
                <label className='llabel'>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className='llabel'>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className='lbutton'>Login</button>
            <p className='lp'><Link to='/register' className='llink'>Don't have an account? Register here</Link></p>
            
            {error && <p className="error">{error}</p>}
        </form>
    );
};

export default Login;
