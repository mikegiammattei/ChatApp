'use strict';

const passport = require('passport');
const User = require('../models/user');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const secret = require('../secret/secretFile');

passport.serializeUser((user,done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use( new GoogleStrategy({
    clientID: secret.google.clientID,
    clientSecret: secret.google.clientSecret,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    passReqToCallback: true

},(req, accessToken, refreshToken, profile, done) => {

    User.findOne({google: profile.id} ,(err, user) =>{
        if(err){
            return done(err);
        }
        // If user is in database
        if(user){
            return done(null, user);
        }else{
            // Not in  database so add new user to database
            const newUser = new User();
            newUser.google = profile.id;
            newUser.fullname = profile.displayName;
            newUser.email = profile.email[0].value;
            newUser.userImage = profile._json.image.url;

            // Save user data
            newUser.save((err) =>{
               if(err){
                   return done(err);
               }
                return done(null, newUser);
            });
        }
    });

}));
