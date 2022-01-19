const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    firstName: String,
    lastName: String,
    qualification: String,
    experience: String,
    gender: String,
    subject: String,
    address: String,
    district: String,
    email: {
        type: String,
        unique: true
    },
    phone: Number,
    additionalInfo: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;