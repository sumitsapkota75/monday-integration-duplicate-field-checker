const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: String,
    age: Number,
})

const UserModel = mongoose.model('User',UserSchema)


module.exports ={
    UserModel
}