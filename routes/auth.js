import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
}));

router.get('/callback', passport.authenticate('auth0', {
    failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/dashboard');
    }
);

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        // Redirect to the Auth0 logout endpoint to clean up the session
        const logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
        logoutURL.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID);
        logoutURL.searchParams.set('returnTo', process.env.BASE_URL);

        res.redirect(logoutURL.toString());
    });
});

export const requireAuth = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

export default router;  