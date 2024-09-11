const User = require("../models/user");
const bcrypt = require("bcrypt");
const emailService = require("../helpers/send-mail");
const config = require("../config")
const crypto = require("crypto");
const { Op } = require("sequelize");



exports.get_register = async function(req, res, next) {
    try {
        return res.render("auth/register", {
            title: "register",
            csrfToken : req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
};


exports.post_register = async function(req,res,next){
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    try {
        
        await User.create({
            fullname : name,
            email : email,
            password : password,
           
        });

        // email services

        // emailService.sendMail({
        //     from : config.email.from,
        //     to : newUser.email,
        //     subject : "Hesabınız Oluşturuldu",
        //     text : "Hesabınız başarılı bir şekilde oluşturuldu."
        // })


        req.session.message = { text : "You can Log in", class: "success"}

        return res.redirect("login")
    }  catch(err) {
        let msg = ""

        if(err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError"){
            for(let e of err.errors){
                msg += e.message + " "
            }
            return res.render("auth/register", {
                title: "register",
                message : {text : msg , class : "danger"}
            });
        }else{
            next(err);
        }
       
    }
}
exports.get_login = async function(req,res,next){
    const message = req.session.message;
    delete req.session.message
    try {
        return res.render("auth/login",{
            title : "login",
            message : message,
            csrfToken : req.csrfToken()
        })
    } catch (err) {
        next(err)
    }
};

exports.post_login = async function(req,res,next){
    const email = req.body.email
    const password = req.body.password
   try {
    const user = await User.findOne({
        where : {
            email : email
        }
    });

    if(!user){
        return res.render("auth/login",{
            title : "login",
            message : {text : "Wrong Email or Password", class : "danger"}
        });
    }

    const match = await bcrypt.compare(password, user.password)
    if(match){

        req.session.isAuth = true;
        req.session.fullname = user.fullname;
        req.session.avatar = user.avatar;
        
        const url = req.query.returnUrl || "/"
        return res.redirect(url)
    }

    return res.render("auth/login",{
        title : "login",
        message : {text : "Wrong Email or Password", class : "danger"}
    });


   } catch (err) {
    next(err)
   };
};

exports.get_logout = async function(req,res,next){
    try {
        await req.session.destroy();
        return res.redirect("/account/login");
        
    } catch (err) {
        next(err)
    }
}

exports.get_reset = async function(req,res,next){
    const message = req.session.message;
    delete req.session.message
    try {
        return res.render("auth/reset-password",{
            title : "reset password",
            message : message
        })
    } catch (err) {
        next(err)
    }
};

exports.post_reset = async function(req,res,next){
    const email = req.body.email
    try {
        let token = crypto.randomBytes(32).toString("hex");
        const user = await User.findOne({ where: { email : email}})
        if(!user){
            req.session.message = {text : "Email not found", class : "danger"}
            return res.redirect("reset-password");
        }

        user.resetToken = token
        user.resetTokenExpiration = Date.now() + (1000 * 60 * 60);
        await user.save();

        emailService.sendMail({
            from : config.email.from,
            to : email,
            subject : "Reset Password",
            html : `
            <p>"Click the link below to update your password."</p>
            <p>
            <a href="<siteaddress>/account/new-password/${token}">Reset Password</a>
            </p>
            `
        })

        req.session.message = {text : "Please check your email address to reset your password.", class : "success"}
        res.redirect("login")

    } catch (err) {
        next(err)
    }
};

exports.get_newPassword = async function(req,res,next){
    const token = req.params.token
    try {
        const user = await User.findOne({
            where :  {
                resetToken : token,
                resetTokenExpiration : {
                    [Op.gt] : Date.now()
                }
            }
        })
        return res.render("auth/new-password",{
            title : "new password",
            token : token,
            userId : user.id
            
        })
    } catch (err) {
        next(err)
    }
};

exports.post_newPassword = async function(req,res,next){
    const token = req.body.token
    const userId = req.body.userId
    const newPassword = req.body.password
    try {
        const user = await User.findOne({
            where :  {
                resetToken : token,
                resetTokenExpiration : {
                    [Op.gt] : Date.now()
                },
                id : userId
            }
        })
        user.password = await bcrypt.hash(newPassword, 10)
        user.resetToken = null
        user.resetTokenExpiration = null
        await user.save();

        req.session.message = { text: "Your password has been updated.", class: "success"}
        res.redirect("login")
    } catch (err) {
        next(err)
    }
};