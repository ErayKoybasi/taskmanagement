const express = require("express");
const app = express();

// session //csrf //cookie-parser
const cookieParser = require("cookie-parser");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const csurf = require("csurf");

// node modules
const path = require("path");

// routes
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

// custom modules
const sequelize = require("./data/db");
const dummyData = require("./data/dummy-data");
const locals = require("./middlewares/locals");
const log = require("./middlewares/log");
const error = require("./middlewares/error-handling")

// template engine - EJS
app.set("view engine", "ejs");

// Models 
const Form = require("./models/form");
const Category = require("./models/category");
const User = require("./models/user");





// middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret : "hello world",
    resave : false,
    saveUninitialized : false,
    cookie : {
        maxAge : 1000 * 60 * 60
    },
    store : new SequelizeStore({
        db : sequelize
    })
}))


app.use(locals)
app.use(csurf());

// static files
app.use("/libs",express.static(path.join(__dirname,"node_modules")));
app.use("/static", express.static(path.join(__dirname, "public")));

// Routes

app.use(userRoutes);
app.use("/account",authRoutes)
app.use("*",(req,res) => {
    res.status(404).render("error/404", {title : "not founds"})
})
app.use(log)
app.use(error)


// relations

Form.belongsTo(User,{
    foreignKey : {
        allowNull : true
    }
});
User.hasMany(Form);

Form.belongsToMany(Category, {through : "formCategories"});
Category.belongsToMany(Form, {through : "formCategories"});

// async

(async () => {
    await sequelize.sync({force : true});
    await dummyData()
})();

// Ports
app.listen(5000,function(){
    console.log("listening 5000 ports")
})