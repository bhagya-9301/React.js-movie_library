const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
const port = 5000;

// Session secret key
const secret = 'YOUR_SECRET_KEY';

// MySQL connection

// Connect to MySQL

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware to check authentication
const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    next();
};

const router = express.Router();

// Check-auth 
app.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ authenticated: true, userId: req.session.userId });
    } else {
        res.status(200).json({ authenticated: false, userId: null });
    }
});

// Register 
app.post('/register', (req, res) => {
    const { full_name, email_id, contact_number, password, confirm_password } = req.body;

    if (password === confirm_password) {
        bcrypt.hash(password, 10, (err, hashed_password) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Server error');
            }
            const sql = 'INSERT INTO (database store registration) (full_name, email_id, contact_number, pass) VALUES (?, ?, ?, ?)';
            const values = [full_name, email_id, contact_number, hashed_password];
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting into database:', err);
                    return res.status(500).send('Error: ' + err.message);
                }
                res.status(200).send('Registration successful');
            });
        });
    } else {
        res.status(400).send('Passwords do not match.');
    }
});

// Login   
app.post('/login', (req, res) => {
    const { email_id, password } = req.body;
    const sql = "SELECT id, full_name, pass FROM (database store registration) WHERE email_id = ?";
    db.query(sql, [email_id], (err, results) => {
        if (err) {
            console.error('Database error: ', err);
            return res.status(500).send('An error occurred, please try again later.');
        }
        if (results.length === 0) {
            return res.status(400).send('Invalid email or password.');
        }
        const user = results[0];
        bcrypt.compare(password, user.pass, (bcryptErr, isMatch) => {
            if (bcryptErr) {
                console.error('Bcrypt error: ', bcryptErr);
                return res.status(500).send('An error occurred, please try again later.');
            }

            if (isMatch) {
                req.session.userId = user.id;
                res.status(200).json({ userId: user.id, full_name: user.full_name });
            } else {
                res.status(400).send('Invalid email or password.');
            }
        });
    });
});

//home
app.get('/api/lists/:userId', (req, res) => {
    const { userId } = req.params;

    const publicQuery = 'SELECT * FROM (database store movie list) WHERE user_id = ? AND is_public = 1';
    const privateQuery = 'SELECT * FROM (database store movie list) WHERE user_id = ? AND is_public = 0';

    db.query(publicQuery, [userId], async (err, publicMovies) => {
        if (err) {
            console.error('Error fetching public movies:', err);
            res.status(500).send('Error fetching public movies');
            return;
        }

        db.query(privateQuery, [userId], async (err, privateMovies) => {
            if (err) {
                console.error('Error fetching private movies:', err);
                res.status(500).send('Error fetching private movies');
                return;
            }

            try {
                const fetchMovieDetails = async (list) => {
                    const movieResponse = await axios.get(`https://www.omdbapi.com/?apikey='YOUR_API_KEY'=${list.movie_id}`);
                    return { ...list, movie: movieResponse.data };
                };

                const publicMoviesWithDetails = await Promise.all(publicMovies.map(fetchMovieDetails));
                const privateMoviesWithDetails = await Promise.all(privateMovies.map(fetchMovieDetails));

                res.json({ publicMovies: publicMoviesWithDetails, privateMovies: privateMoviesWithDetails });
            } catch (error) {
                console.error('Error fetching movie details:', error);
                res.status(500).json({ error: 'Failed to fetch movie details' });
            }
        });
    });
});

//save either in public or private
app.post('/api/lists/add', (req, res) => {
    const { user_id, movie_id, is_public } = req.body;
    const deleteQuery = 'DELETE FROM (database store movie list) WHERE user_id = ? AND movie_id = ? AND is_public = ?';
    const addQuery = 'INSERT INTO (database store movie list) (user_id, movie_id, is_public) VALUES (?, ?, ?)';

    db.query(deleteQuery, [user_id, movie_id, !is_public], (deleteErr) => {
        if (deleteErr) {
            console.error('Error deleting movie from the opposite list:', deleteErr);
            return res.status(500).send('An error occurred, please try again later.');
        }

        db.query(addQuery, [user_id, movie_id, is_public], (addErr) => {
            if (addErr) {
                console.error('Error adding movie to the list:', addErr);
                return res.status(500).send('An error occurred, please try again later.');
            }

            res.status(200).send({ message: 'Movie saved successfully' });
        });
    });
});

// Remove movie from list
app.delete('/api/lists/remove', (req, res) => {
    const { userId, movieId } = req.body;

    const deleteQuery = 'DELETE FROM (database store movie list) WHERE user_id = ? AND movie_id = ?';

    db.query(deleteQuery, [userId, movieId], (err, result) => {
        if (err) {
            console.error('Error removing movie from list:', err);
            res.status(500).send('Error removing movie from list');
            return;
        }
        res.send('Movie removed from list successfully');
    });
});

app.delete('/api/lists/remove', checkAuth, (req, res) => {
    const { movieId } = req.body;
    db.query('DELETE FROM (database store movie list) WHERE user_id = ? AND movie_id = ?', [req.session.userId, movieId], (err, results) => {
        if (err) {
            console.error('Error removing movie from list:', err);
            res.status(500).send('Error removing movie from list');
        } else {
            res.send('Movie removed from list successfully');
        }
    });
});

// Fetch movie suggestions from OMDB
app.get('/api/suggestions', async (req, res) => {
    const query = req.query.q;
    try {
        const response = await axios.get(`https://www.omdbapi.com/?apikey='YOUR_API_KEY'=${query}`);
        if (response.data.Response === "True") {
            res.json(response.data.Search);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).send('Error fetching suggestions');
    }
});

// Add movie to list
router.post('/add', async (req, res) => {
    const { movie_id, is_public } = req.body;
    if (!req.session.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.session.userId;

    try {
        
        db.query(
            'INSERT INTO (database store movie list) (movie_id, user_id, is_public) VALUES (?, ?, ?)',
            [movie_id, userId, is_public],
            (err, result) => {
                if (err) {
                    console.error('Error adding movie to list:', err);
                    res.status(500).json({ message: 'Error adding movie to list' });
                } else {
                    res.json({ message: 'Movie saved successfully' });
                }
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error adding movie to list' });
    }
});

app.use('/api/lists', router);

// Logout 
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to log out.');
        }
        res.status(200).send('Logged out successfully.');
    });
});


// Protected route example
app.get('/protected-route', checkAuth, (req, res) => {
    res.send('You are authorized to access this route.');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
