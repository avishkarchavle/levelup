const mongoose = require('mongoose')
const Student = require('../models/student.js')
const Teacher = require('../models/teacher.js')

mongoose.connect('mongodb://localhost:27017/levelUp', {
    useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connnection error:"));
db.once("open", () => {
    console.log("Databse connected");
});


const seedDB = async () => {
    await Student.deleteMany({});
    const student = new Student({
        firstName: "satyam",
        lastName: "bindroo",
        class: 334,
        gender: "m",
        subject: "pcm",
        address: "govond , kslfls kds ",
        email: "aviskar@gmail.com",
        phone: 234932749,
        additionalInfo: "lsjflsjfljdsf  slkfjklds lsjf k",
        username: "sdlkfjdsl"

    })
    await student.save();

    await Teacher.deleteMany({});
    const teacher = new Teacher({
        firstName: "narhare sir",
        lastName: "classes",
        class: 334,
        gender: "m",
        subject: "pcm",
        address: "gov , kslfls kds ",
        email: "narharekar@gmail.com",
        phone: 234932749,
        additionalInfo: "lsjflf slkfjklds lsjf k",
        username: "asa"
    })
    await teacher.save();
}


seedDB().then(() => {
    mongoose.connection.close();
})