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
router.put("/like/:id", authMiddlewares.isAuthenticated, postController.doLike);
router.get('/post/:id/likes', authMiddlewares.isAuthenticated, postController.likesList);
router.get('/comments/:id', authMiddlewares.isAuthenticated, postController.comments);
router.post('/comments/:id', authMiddlewares.isAuthenticated, postController.doComment);
router.delete('/comments/delete/:id', authMiddlewares.isAuthenticated, postController.doDeleteComment);


//ACCOUNT 
router.get('/settings', authMiddlewares.isAuthenticated, accountController.settings);
router.get('/change/password', authMiddlewares.isAuthenticated, accountController.changePassword);
router.post('/change/password/:username', authMiddlewares.isAuthenticated, accountController.doChangePassword);
router.get('/change/username', authMiddlewares.isAuthenticated, accountController.changeUsername);
router.post('/change/username/:username', authMiddlewares.isAuthenticated, accountController.doChangeUsername);
router.post('/deleteAccount/:id', authMiddlewares.isAuthenticated, accountController.deleteAccount);


//USER
router.get('/profile/:username', authMiddlewares.isAuthenticated, userController.profile);
router.post('/list', authMiddlewares.isAuthenticated, userController.search);
router.put('/follow/:username', authMiddlewares.isAuthenticated, userController.doFollow);
router.get('/followers/:username', authMiddlewares.isAuthenticated, userController.followersList);
router.get('/following/:username', authMiddlewares.isAuthenticated, userController.followingList);
router.get("/profile/:username/likes", authMiddlewares.isAuthenticated, userController.likesList);


module.exports = router;