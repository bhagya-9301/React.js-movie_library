import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './MovieDetails.css';
import save from '../components/images/save.jpg';
import { AuthContext } from '../components/AuthContext';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [error, setError] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, userId } = useContext(AuthContext);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axios.get(`https://www.omdbapi.com/?apikey=4a231c73&i=${id}`);
                if (response.data.Response === "True") {
                    setMovie(response.data);
                    setError('');
                } else {
                    setError(response.data.Error);
                }
            } catch (error) {
                console.error(error);
                setError('Error fetching movie details');
            }
        };

        fetchMovie();
    }, [id]);
               
    const handleAddToList = async (isPublic) => {
        if (!isAuthenticated) {
            setError('You must be logged in to add movies to the list');
            navigate('/login');
            return;
        }
    
        const payload = {
            movie_id: id,
            is_public: isPublic, 
            user_id: userId
        };
    
        console.log('Payload:', payload); 
    
        try {
            const response = await axios.post('http://localhost:5000/api/lists/add', payload, {
                withCredentials: true
            });
    
            if (response.data.message === "Movie saved successfully") {
                setDropdownVisible(false);
                navigate('/home');
            } else {
                setError('Error adding movie to list');
            }
        } catch (error) {
            console.error('Error in handleAddToList:', error);
            setError('Error adding movie to list');
        }
    };
    
    
    return (
        <div className="movie-detail-container">
            <button className="back-button" onClick={() => window.history.back()}>←</button>

            {error && <p className="error-message">{error}</p>}

            {movie && (
                <div className="movie-detail-content">
                    <div className="movie-header">
                        <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
                        <div className="movie-main-info">
                            <p className='imdb'><strong>IMDB Rating:</strong> {movie.imdbRating}</p>
                            <h2 className='mdh2'>{movie.Title}</h2>
                            <p className='mdp'>{movie.Year}</p>
                            <button className='save-btn' onClick={() => setDropdownVisible(!dropdownVisible)}>
                                <img src={save} alt='save' className='save-logo' />
                            </button>
                            {dropdownVisible && (
                                <div className="dropdown-menu">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="listType"
                                            value="public"
                                            onChange={() => handleAddToList(true)}
                                            className="radio-input"
                                        />
                                        Public
                                    </label>
                                    <br />
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="listType"
                                            value="private"
                                            onChange={() => handleAddToList(false)}
                                            className="radio-input"
                                        />
                                        Private
                                    </label>
                                </div>
                            )}
                            <p className='plot'> {movie.Plot}</p>
                            <p><strong>Director :</strong> &emsp;&emsp; {movie.Director}</p>
                            <p><strong>Actors :</strong> &emsp;&emsp;&emsp;{movie.Actors}</p>
                            <p><strong>Genre :</strong>&emsp;&emsp;&emsp;&nbsp; {movie.Genre}</p>
                            <p><strong>Writer :</strong>&emsp;&emsp;&emsp; {movie.Writer}</p>
                            <p><strong>Language :</strong>&emsp;&emsp; {movie.Language}</p>
                            <p><strong>Country :</strong>&emsp;&emsp;&emsp;{movie.Country}</p>
                            <p><strong>Awards :</strong>&emsp;&emsp;&emsp;{movie.Awards}</p>
                            <p><strong>Production :</strong> &emsp; {movie.Production}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetail;
