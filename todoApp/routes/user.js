const express = require("express");
const router = express.Router();
const imageUpload = require("../helpers/image-upload");
const userController = require("../controllers/user");
const isAuth = require("../middlewares/auth")
const csrf = require("../middlewares/csrf")

router.get('/tasks/category/:slug',isAuth,csrf, userController.getTasksByCategory);

router.get("/category/create",isAuth,csrf,userController.get_category)

router.post("/category/create",isAuth,userController.post_category)

router.post('/tasks/:slug/complete',isAuth,userController.complete_task);

router.get("/edit/:formid", isAuth,csrf,userController.get_tasks_Edit)

router.post("/edit/:formid",isAuth,imageUpload.upload.single("image"),userController.post_tasks_Edit)

router.get("/delete/:slug",isAuth, csrf,userController.get_task_Delete)

router.post("/delete/:slug",isAuth, userController.post_task_Delete)

router.post("/create",isAuth,csrf,imageUpload.upload.single("image"), userController.post_task_Create)

router.get("/create",isAuth,csrf, userController.get_task_Create)

router.get("/tasks/:slug",isAuth,csrf, userController.tasklist_detail)

router.get("/tasks",csrf,isAuth,userController.tasklist)

router.get("/", csrf,userController.index)

module.exports = router;