import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import logo from '../components/images/search.jpg';
import { AuthContext } from '../components/AuthContext';

const Home = () => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState('');
    const [publicLists, setPublicLists] = useState([]);
    const [privateLists, setPrivateLists] = useState([]);
    const { isAuthenticated, userId, fullName } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (userId) {
            console.log('User ID:', userId);
            fetchLists(userId);
        }
    }, [isAuthenticated, navigate, userId]);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            if (!query) {
                setError('Please enter a movie name.');
                return;
            }
            const response = await axios.get(`https://www.omdbapi.com/?apikey='YOUR_API_KEY'=${query}`);
            if (response.data.Response === "True") {
                setMovies(response.data.Search);
                setError('');
            } else {
                setMovies([]);
                setError(response.data.Error);
            }
        } catch (error) {
            console.error(error);
            setError('Error fetching movies');
        }
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const fetchLists = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/lists/${userId}`);
            setPublicLists(response.data.publicMovies);
            setPrivateLists(response.data.privateMovies);
        } catch (error) {
            console.error('Error fetching lists:', error);
        }
    };


    const handleRemoveFromList = async (movieId) => {
        try {
            const response = await axios.delete('http://localhost:5000/api/lists/remove', {
                data: { userId, movieId }
            });
            if (response.data === "Movie removed from list successfully") {
                fetchLists(userId);
            } else {
                setError('Error removing movie from list');
            }
        } catch (error) {
            console.error(error);
            setError('Error removing movie from list');
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    return (
        <div className="home-container">
            <div className='logout'>
                <button className='logout-btn' onClick={handleLogout}>
                    <Link to="/">Logout</Link>
                </button>
            </div>
            <div className="header">
            <p>Welcome to home page, {fullName}</p>
                <h2>Movie Search</h2>
                <form onSubmit={handleSearch} className='search-bar'>
                    <input
                        type="text"
                        placeholder="Search for a movie..."
                        value={query}
                        onChange={handleInputChange}
                    />
                    <button type='submit' className='submit-btn'>
                        <img src={logo} alt='logo' className='search-logo' />
                    </button>
                </form>

                {error && <p className="error">{error}</p>}
            </div>

            <h2 className='related-movie-list'>Movies related to your search</h2>
            <div className="movies-list">
                {movies.map(movie => (
                    <div key={movie.imdbID} className="movie-card">
                        <Link to={`/movie/${movie.imdbID}`}>
                            <img src={movie.Poster} alt={movie.Title} />
                            <h3>{movie.Title}</h3>
                            <p>{movie.Year}</p>
                        </Link>
                        
                    </div>
                ))}
            </div>
            
            <div className="list-container">
                <h2 className='list_h2'>Public Lists</h2>
                <div className="list">
                    {publicLists.length === 0 ? (
                        <p>No public movies found.</p>
                    ) : (
                        publicLists.map(list => (
                            <div key={list.id} className="movie-card">
                                <Link to={`/movie/${list.movie_id}`}>
                                    <h3>{list.movie.Title}</h3>
                                    <p>{list.movie.Year}</p>
                                    <img src={list.movie.Poster} alt={list.movie.Title} />
                                </Link>
                                <button onClick={() => handleRemoveFromList(list.movie_id)}>Remove</button>
                            </div>
                        ))
                    )}
                </div>
                <h2 className='list_h2'>Private Lists</h2>
                <div className="list">
                    {privateLists.length === 0 ? (
                        <p>No private movies found.</p>
                    ) : (
                        privateLists.map(list => (
                            <div key={list.id} className="movie-card">
                                <Link to={`/movie/${list.movie_id}`}>
                                    <h3>{list.movie.Title}</h3>
                                    <p>{list.movie.Year}</p>
                                    <img src={list.movie.Poster} alt={list.movie.Title} />
                                </Link>
                                <button onClick={() => handleRemoveFromList(list.movie_id)}>Remove</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
