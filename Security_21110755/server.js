const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');
const helmet = require('helmet');
const passport = require('passport');
const cookieSession = require('cookie-session');
const { Strategy } = require('passport-google-oauth20');
const { verify } = require('crypto');

require('dotenv').config();

const PORT = 3000;

const config = { 
    CLIEN_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIEN_ID,
    clientSecret: config.CLIENT_SECRET,

}


function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

//save 
passport.serializeUser((user, done) => {
    done(null, user);
});
//read
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const app = express();



app.use(helmet());

app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [ config.COOKIE_KEY_1, config.COOKIE_KEY_2],
}));

app.use(passport.initialize());
app.use(passport.session());


function checkLoggedIn(req, res, next) {
    const IsLoggin = true;
    if (IsLoggin) {
        return res.status(401).json({
            error: 'Unauthorized you must login first!',
        
        });

        next();
    }
    
}

app.get('/auth/google', passport.authenticate('google', {
    scope: [ 'email'],
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true,
}), (req, res) => {
    console.log(' google call us back');
});

app.get('/auth/logout', (req, res) => {
    
});

app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send('Your personal secret value  is 42');
});

app.get('/failure', (req, res) => {
    return res.send('You have failed to login');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



http.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),

}, app).listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
