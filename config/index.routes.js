const router = require('express').Router();
const passport = require('passport');

//CONTROLLERS
const authController = require('../controllers/auth.controller');
const authMiddlewares = require('../middlewares/auth.middleware');
const postController = require('../controllers/posts.controller');
const accountController = require('../controllers/account.controller');
const userController = require('../controllers/users.controller');

const fileUploader = require('./cloudinary.config');

const SCOPES = [
    "profile",
    "email"
];

//ROUTES:

//AUTH
router.get('/register', authMiddlewares.isNotAuthenticated, authController.register);
router.post('/register', authMiddlewares.isNotAuthenticated, authController.doRegister);
router.get('/', authMiddlewares.isNotAuthenticated, authController.login);
router.post('/', authMiddlewares.isNotAuthenticated, authController.doLogin);
router.get('/login/google', authMiddlewares.isNotAuthenticated, passport.authenticate('google-auth', { scope: SCOPES  }));
router.get('/auth/google/callback', authMiddlewares.isNotAuthenticated, authController.doLoginGoogle);
router.get("/logout", authMiddlewares.isAuthenticated, authController.logout);
router.get('/activate/:token', authMiddlewares.isNotAuthenticated, authController.activateAccount);

//HOME (POSTS)
router.get('/home', authMiddlewares.isAuthenticated, postController.home);
router.post('/home', authMiddlewares.isAuthenticated, fileUploader.single('image'), postController.doCreate);
router.delete('/home/deletePost/:id', authMiddlewares.isAuthenticated, postController.doDelete);

//ACCOUNT 
router.get('/settings', authMiddlewares.isAuthenticated, accountController.settings);
router.get('/changePassword', authMiddlewares.isAuthenticated, accountController.changePassword);
router.post('/changePassword/:username', authMiddlewares.isAuthenticated, accountController.doChangePassword);
router.post('/deleteAccount/:id', authMiddlewares.isAuthenticated, accountController.deleteAccount);

//USER
router.get('/profile/:username', authMiddlewares.isAuthenticated, userController.profile);
router.post('/list', authMiddlewares.isAuthenticated, userController.search);

module.exports = router;