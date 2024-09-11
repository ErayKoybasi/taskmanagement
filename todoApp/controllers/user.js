const Form = require("../models/form")
const Category = require("../models/category")
const sequelize = require("../data/db");
const { Op } = require("sequelize");
const slugField = require("../helpers/slugfield");
const fs = require("fs");




exports.getTasksByCategory = async function(req, res,next) {
    const slug = req.params.slug;

    try {
        const { rows, count } = await Form.findAndCountAll({ 
            where: { checked : {[Op.eq]: true } },
            raw: true,
            include: slug ? { model: Category, where: { url: slug } } : null,

        });

        const categories = await Category.findAll({ raw: true });

        res.render("users/tasks", {
            title: "All Tasks",
            forms: rows,
            totalItems: count,
            categories: categories,
            selectedCategory: slug
        })
    }
    catch(err) {
       next(err)
    }
}


exports.get_category = async function(req, res,next) {
    try {
        res.render("users/create-category", {
            title: "add category"
        });
    }
    catch(err) { 
       next(err)
    }
}


exports.post_category = async function(req, res,next) {
    const name = req.body.name
    const url = req.body.url
    if (!name) {
       
        return res.redirect("/category/create");
    }

    try {
        await Category.create({ name: name , url : url});;
        res.redirect("/");
    } catch (err) {
        next(err);
        res.redirect('/category/create');
    }
}


exports.complete_task = async function(req, res,next) {
    const { slug } = req.params;
    try {
        const form = await Form.findOne({
            where: { url: slug },
            include: [{
                model: Category,
                through: { attributes: [] }
            }]
        });

        if (form) {
            form.completed = true;
            await form.save();
            return res.render("users/task-details",{
                form : form,
                title : "Okey"
            }
           );
        }
    } catch (err) {
        next(err)
        
    }
};

exports.get_tasks_Edit = async function(req, res,next) {
    const formid = req.params.formid;

    try {
        const form = await Form.findOne({
            where: {
                id: formid
            },
            include: {
                model: Category,
                attributes: ["id"]
            }
        });
        const categories = await Category.findAll();

        if(form) {
            return res.render("users/tasks-edit", {
                title: form.dataValues.header,
                form: form.dataValues,
                categories: categories
            });
        }

        res.redirect("/");
    }
    catch(err) {
        next(err)
    }
}


exports.post_tasks_Edit = async function(req,res,next){
    const formid = req.body.formid;
    const header = req.body.header;
    const tasks = req.body.tasks;
    const kategoriIds = req.body.categories;
    

    let image = req.body.image;

    if(req.file) {
        image = req.file.filename;

        fs.unlink("./public/images/" + req.body.image, err => {
            console.log(err);
        });
    }

    const homepage = req.body.homepage == "on" ? 1 : 0;
    const checked = req.body.checked == "on" ? 1 : 0;

    try {
        const form = await Form.findOne({
            where: {
                id: formid
            },
            include: {
                model: Category,
                attributes: ["id"]
            }
        });
        if(form) {
            form.header = header;
            form.tasks = tasks;
            form.image = image;
            form.homepage = homepage;
            form.checked = checked;
            
            
            if(kategoriIds == undefined) {
                await form.removeCategories(form.categories);
            } else {
                await form.removeCategories(form.categories);
                const selectedCategories = await Category.findAll({
                    where: {
                        id: {
                            [Op.in]: kategoriIds
                        }
                    }
                });
                await form.addCategories(selectedCategories);
            }

            await form.save();
            return res.redirect("/tasks");
        }
        res.redirect("/");
    }
    catch(err) {
        next(err)
    }
}

exports.get_task_Delete = async function(req, res,next) {
        const slug = req.params.slug;
        try {
            const form = await Form.findOne({
                where: {
                    url: slug
                }
            });
    
            if (form) {
                return res.render("users/task-delete", {
                    form: form,
                    title: form.header
                });
            }
            res.redirect("/");
    } catch (err) {
        console.log(err)
    }
}

exports.post_task_Delete = async function(req,res){
    const slug = req.params.slug;
    try {
        const form = await Form.findOne({
            where : {
                url : slug
            }
        })
        if(form){
            await form.destroy();
            return res.redirect("/tasks")
        }
        res.redirect("/")
    } catch (err) {
        console.log(err)
    }    
}

exports.get_task_Create = async function(req,res){
    try {
        
        const categories = await Category.findAll();
        res.render("users/create-tasks",{
            title : "create a task",
            categories : categories
            
        })
    } catch (err) {
        next(err)
    }
}

exports.post_task_Create = async function(req, res,next) {
    const header = req.body.header;
    const tasks = req.body.tasks;
    const homepage = req.body.homepage === "on" ? 1 : 0;
    const checked = req.body.checked === "on" ? 1 : 0;
    const categoryIds = req.body.categories;

    try {
      
        let image = null;
        if (req.file) {
          image = req.file.filename;

          if (req.body.image) {
            fs.unlink(`./public/images/${req.body.image}`, (err) => {
              if (err) {
                console.error("File deletion error:", err);
                return next(err);
              }
              console.log("The old image was successfully deleted.");
            });
          } else {
            console.log("No image found to delete.");
          }
        }

    
        if(header == ""){
            throw new Error("Header is not null")
        }
        
        if(header.length < 5 || header.length > 30){
            throw new Error("Header length is too short.")
        }
    
        if(tasks == ""){
            throw new Error("Task is not null")
        }
        if(homepage == "" && checked == ""){
            throw new Error("You have to choose homepage or checked.")
        }
    

        const newForm = await Form.create({
            header: header,
            tasks: tasks,
            url: slugField(header),
            image: image,
            homepage: homepage,
            checked: checked,
        });

        
        if (categoryIds && categoryIds.length > 0) {
            await newForm.setCategories(categoryIds);  
        }

        res.redirect("tasks?action=create"); 
    } catch (err) {
        
        let OwnErrMessage = ""

       if(err instanceof Error){
        OwnErrMessage += err.message
        res.render("users/create-tasks",{
            title : "create a task",
            categories : await Category.findAll(),
            message : {text : OwnErrMessage, class: "danger"},
            values: {
                header: header,
                tasks: tasks,
            }
            
        })
       }
    }
}



exports.tasklist_detail = async function(req, res,next) {
    const slug = req.params.slug;

    try {
        const form = await Form.findOne({
            where: { 
                url: slug 
            },
            include: [{
                model: Category,
                through: { attributes: [] }
            }]
        });
        
        const categories = await Category.findAll();

        if (form) {
            return res.render("users/task-details", {
                title: form.header,
                form: form,
                categories: categories
            });
        }
        res.redirect("/404");
    } catch (err) {
        next(err)
    }
};



exports.tasklist = async function(req,res,next){
    
    try {
        const forms = await Form.findAll({
            where : {
                [Op.and] : {
                    homepage : true
                },
                [Op.and] : {
                    checked : true
                }
            },
            include: [{
                model: Category,
                through: { attributes: [] },
            }]
            
        })
        const categories = await Category.findAll()
        res.render("users/tasks",{
            title: "tasks",
            forms : forms,
            categories : categories,
            action: req.query.action
            
        })
    } catch (err) {
        next(err)
    }
}

exports.index = async function(req, res,next) {
    
    try {
        
        const forms = await Form.findAll({
            where: {
                homepage: true,
            },
            include: [{
                model: Category,
                through: { attributes: [] },
            }]
        });

        const categories = await Category.findAll();
        
        res.render("users/index", {
            title: "home",
            forms: forms,
            categories: categories,
            action: req.query.action,
            selectedCategory: null
        });
    } catch (err) {
        next(err)
    }
};