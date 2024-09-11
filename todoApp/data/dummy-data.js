const Category = require("../models/category");
const Form = require("../models/form");
const slugField = require("../helpers/slugfield");
const User = require("../models/user")
const bcrypt = require("bcrypt");

async function populate(){
    const count = await Category.count();

    if(count == 0){
        const categories = await Category.bulkCreate([
            {name : "Kategori 1",url: slugField("Kategori 1"),},
            {name : "Kategori 2",url: slugField("Kategori 2"),},
            {name : "Kategori 3",url: slugField("Kategori 3"),}
        ]);

        const forms = await Form.bulkCreate([
            {
                header : "example title 1",
                tasks : "example task 1",
                url : slugField("example title 1"),
                homepage : true,
                checked : true
            },
            {
                header : "example title 2",
                tasks : "example task 2",
                url : slugField("example title 2"),
                homepage : true,
                checked : true
                
            },
            {
                header : "example title 3",
                tasks : "example task 3",
                url : slugField("example title 3"),               
                homepage : false,
                checked : true
            },
            {
                header : "example title 4",
                tasks : "example task 4",
                url : slugField("example title 4"),               
                homepage : true,
                checked : false
            }

        ])

        const users = await User.bulkCreate([
            {fullname : "john doe", email : "info@johndoe.com", password : await bcrypt.hash("123456",10)},
            {fullname : "jonny doe", email : "info@jonnydoe.com", password : await bcrypt.hash("123456",10)},
            
        ]);

        await categories[0].addForm(forms[0]);
        await categories[1].addForm(forms[1]);
        await categories[2].addForm(forms[2]);
        await categories[0].addForm(forms[3]);




        await forms[0].addCategory(categories[1]);

    }
}

module.exports = populate;