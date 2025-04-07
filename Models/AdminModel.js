const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    name:{
        type: String,
        require: true 
    },
    pic:{
        type: String,
    }
},{ timestamps: true })

const admins = mongoose.model("admins",adminSchema);
module.exports=admins;