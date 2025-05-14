const mongoose = require("mongoose");
const category = new mongoose.Schema({
    categoryName:{
        type:String, 
        unique:true,
        required:true,
    },
    podcasts:[
        {
            type:mongoose.Types.ObjectId,
            ref:"podcasts",
        },
    ],
},
{timestamps:true}
);

module.exports = mongoose.models.Category || mongoose.model("Category", category);