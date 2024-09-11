module.exports = function(req, res, next) {
    res.locals.isAuth = req.session.isAuth;
    res.locals.fullname = req.session.fullname;
    res.locals.avatar = req.session.avatar
    next();
}