const Student = require('./models/student');
const Teacher = require('./models/teacher');
const expressError = require('./utils/expressError');
const { studentSchema, teacherSchema } = require('./schemas');


module.exports.validateTeacher = (req, res, next) => {
    const { error } = teacherSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next()
    }
}

module.exports.validateStudent = (req, res, next) => {
    const { error } = studentSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'you must be logged in');
        return res.redirect('/login');
    }

    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/login`);
    }

    next();
}

module.exports.isTeacher = async (req, res, next) => {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);

    if (!teacher.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/login`);
    }

    next();
}