import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import dotenv from 'dotenv';

dotenv.config();

// Configure Passport to use Auth0
passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
  },
  function(accessToken, refreshToken, extraParams, profile, done) {

    console.log('Auth0 Profile:', profile.displayname); 
    // Save the user profile to the session
    return done(null, profile);
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;