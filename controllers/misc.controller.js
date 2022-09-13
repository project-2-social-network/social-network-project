const mailer = require("../config/mailer.config");

module.exports.help = (req, res, next) => {
    res.render('help')
};

module.exports.doHelp = (req, res, next) => {
    const { text, email } = req.body
    mailer.sendHelpEmail(email, text);
    res.render('help', {emailMessage: `Email successfuly sent. We'll get in touch with you ASAP.`})
};