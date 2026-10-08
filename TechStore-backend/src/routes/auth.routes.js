import { Router } from 'express';
import passport from 'passport';
import { register, login, verifyMFA, socialCallback } from '../controllers/auth.controller.js';

const router = Router();

// Rutas de autenticación local y MFA
router.post('/register', register);
router.post('/login', login);
router.post('/verify-mfa', verifyMFA);

// OAuth Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) return res.status(401).json({ message: 'Falló la autenticación con Google' });
    req.user = user;
    return socialCallback(req, res);
  })(req, res, next);
});

// OAuth GitHub
router.get('/github', passport.authenticate('github'));
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user, info) => {
    if (err || !user) return res.status(401).json({ message: 'Falló la autenticación con GitHub' });
    req.user = user;
    return socialCallback(req, res);
  })(req, res, next);
});

export default router;