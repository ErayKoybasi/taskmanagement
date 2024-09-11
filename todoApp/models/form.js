const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Form = sequelize.define("form",{
    header : {
        type : DataTypes.STRING,
        allowNull : false
    },
    tasks : {
        type : DataTypes.TEXT,
        allowNull : false
    },
    url : {
        type : DataTypes.STRING,
        allowNull : false
    },
    image : {
        type: DataTypes.STRING,
        allowNull: true
    },
    homepage : {
        type : DataTypes.BOOLEAN,
        allowNull : false
    },
    checked : {
        type : DataTypes.BOOLEAN,
        allowNull : false
    },
    completed: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false 
    }

},{
    timestamps : true
})

module.exports = Form;