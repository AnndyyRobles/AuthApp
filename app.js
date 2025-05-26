import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import {dirname, join} from 'path';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import authRoutes, { requireAuth } from './routes/auth.js';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const userAvatars = {};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // folder where the files will be saved
  },
  filename: (req, file, cb) => {
    const userId = req.user.id.replace(/[^a-zA-Z0-9]/g, '');
    const uniqueName = `${userId}-${Date.now()}.jpg`;
    cb(null, uniqueName); // unique name for the file
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // max file size 5MB
});

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views')); // Set the views directory

//Middleware
app.use(express.static(join(__dirname, 'public'))); // Serve static files from the public directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, 
    cookie: { secure: false } 
})); // Session middleware

app.use(passport.initialize());
app.use(passport.session()); // Initialize Passport and restore authentication state

app.use((req, res, next) => {
    res.locals.user = req.user || null; // Make user available in views
    next();
}); // Middleware to set user in response locals


app.use('/auth', authRoutes); // Use the auth routes


app.get('/', (req, res) => {
    res.render('home', { user: req.user, req: req, userAvatars: userAvatars });
});

app.get('/dashboard', (req, res) => {
    if(req.user) {
        res.render('dashboard', { user: req.user, req: req, userAvatars: userAvatars });
    } else {
        res.redirect('/auth/login');
    }
})

app.post('/upload-avatar', requireAuth, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.redirect('/dashboard?error=no-file');
  }
  
  userAvatars[req.user.id] = `/uploads/${req.file.filename}`;
  res.redirect('/dashboard?success=uploaded');
});

// app.get('/debug', (req, res) => {
//     // Ver TODAS las propiedades de req
//     const reqProperties = Object.getOwnPropertyNames(req);
//     const reqMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(req));
    
//     res.json({
//         properties: reqProperties,
//         methods: reqMethods,
//         user: req.user,
//         isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'No existe'
//     });
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});