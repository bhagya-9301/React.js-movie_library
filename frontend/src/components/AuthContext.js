import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [fullName, setFullName] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:5000/check-auth', { withCredentials: true });
                console.log('Check Auth Response:', response.data); 
                setIsAuthenticated(response.data.authenticated);
                setUserId(response.data.userId);
                setFullName(response.data.fullName);
            } catch (error) {
                console.error('Failed to check authentication:', error);
                setIsAuthenticated(false);
                setUserId(null);
                setFullName(null);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/login', { email_id: email, password }, { withCredentials: true });
            console.log('Login Response:', response.data); 
            setIsAuthenticated(true);
            setUserId(response.data.userId);
            setFullName(response.data.full_name);
            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            setIsAuthenticated(false);
            setUserId(null);
            setFullName(null);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
            setIsAuthenticated(false);
            setUserId(null);
            setFullName(null);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, fullName, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthContext, AuthProvider, useAuth };
