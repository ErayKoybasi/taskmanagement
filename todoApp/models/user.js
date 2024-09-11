const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../data/db");

const User = sequelize.define("user",{
    fullname : {
        type : DataTypes.STRING,
        allowNull : false,
        validate : {
            notEmpty : {
                msg : "enter your full name"
            }
        },
        isFullname(value){
            if(value.split(" ").length < 2){
                throw new Error("Please enter your fullname")
            }
        }
    },
    email : {
        type : DataTypes.STRING,
        allowNull : false,
        unique: {
            args: true,
            msg: "The email has already been taken."
        },
        validate: {
            notEmpty: {
                msg: "You must enter an email."
            },
            isEmail: {
                msg: "A valid email is required."
            }
        }
    },
    password : {
        type : DataTypes.STRING,
        allowNull : false,
        validate : {
            notEmpty : {
                msg : "Password cant be null."
            },
            len: {
                args: [5, 10],
                msg: "The password must be 5-10 characters long."
            }
        }
    },
    resetToken :{
        type : DataTypes.STRING,
        allowNull : true
    },
    resetTokenExpiration :{
        type : DataTypes.DATE,
        allowNull : true
    }
},{
    timestamps : true
})

User.afterValidate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
});


module.exports = User;