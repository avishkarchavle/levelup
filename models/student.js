const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    firstName: String,
    lastName: String,
    class: Number,
    gender: String,
    subject: String,
    address: String,
    district: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: Number,
    additionalInfo: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;