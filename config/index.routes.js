const router = require('express').Router();
const passport = require('passport');

//CONTROLLERS
const authController = require('../controllers/auth.controller');
const authMiddlewares = require('../middlewares/auth.middleware');
const userController = require('../controllers/users.controller');
const postController = require('../controllers/posts.controller');

const fileUploader = require('./cloudinary.config');

const SCOPES = [
    "profile",
    "email"
];

//ROUTES
//HOME (POSTS)
router.get('/home', authMiddlewares.isAuthenticated, postController.home);
router.post('/home', authMiddlewares.isAuthenticated, postController.doCreate);
router.delete('/home/deletePost/:id', authMiddlewares.isAuthenticated, postController.doDelete);


//AUTH
router.get('/register', authMiddlewares.isNotAuthenticated, authController.register);
router.post('/register', authMiddlewares.isNotAuthenticated, fileUploader.single('image'), authController.doRegister);
router.get('/', authMiddlewares.isNotAuthenticated, authController.login);
router.post('/', authMiddlewares.isNotAuthenticated, authController.doLogin);
router.get('/login/google', authMiddlewares.isNotAuthenticated, passport.authenticate('google-auth', { scope: SCOPES  }));
router.get('/auth/google/callback', authMiddlewares.isNotAuthenticated, authController.doLoginGoogle);
router.get("/logout", authMiddlewares.isAuthenticated, authController.logout);
router.get('/activate/:token', authMiddlewares.isNotAuthenticated, authController.activateAccount);

//USER
router.get('/profile/:username', authMiddlewares.isAuthenticated, userController.profile)
router.get('/settings', authMiddlewares.isAuthenticated, userController.settings);
router.get('/changePassword', authMiddlewares.isAuthenticated, userController.changePassword);
router.post('/changePassword/:username', authMiddlewares.isAuthenticated, userController.doChangePassword);
router.post('/deleteAccount/:id', authMiddlewares.isAuthenticated, userController.deleteAccount);


module.exports = router;