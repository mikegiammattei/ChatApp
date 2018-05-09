'use strict';

const passports = require('passport');
const User = require('../models/user');
const FacebookStrategy = require('passport-facebook').Strategy;
const secret = require('../secret/secretFile');

passports.serializeUser((user,done) => {
    done(null, user.id);
});

passports.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passports.use( new FacebookStrategy({
    clientID: secret.facebook.clientID,
    clientSecret: secret.facebook.clientSecret,
    profileFields:  ['email','displayName','photos'],
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    passReqToCallback: true

},(req, token, refreshToken, profile, done) => {

    User.findOne({facebook: profile.id} ,(err, user) =>{
        if(err){
            return done(err);
        }

        if(user){
            return done(null, user);
        }else{
            const newUser = new User();
            newUser.facebook = profile.id;
            newUser.fullname = profile.displayName;
            newUser.email = profile._json.email;
            newUser.userImage = 'https://graph.facebook.com/' + profile.id + 'picture?type-large';
            newUser.fbTokens.push({token: token});

            newUser.save((err) => {
                return done(null, user);
            });

        }

    });

}));
