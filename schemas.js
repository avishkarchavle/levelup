const Joi = require('joi');
const { number } = require('joi');

module.exports.studentSchema = Joi.object({
    student: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        class: Joi.number().min(1).required(),
        subject: Joi.string().required(),
        address: Joi.string().required(),
        gender: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.number().required(),
        username: Joi.string().optional(),
        password: Joi.string().optional(),
        additionalInfo: Joi.string().required(),
        district: Joi.string().allow(''),
    }).required(),
})

module.exports.teacherSchema = Joi.object({
    teacher: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        qualification: Joi.string().required(),
        experience: Joi.string().required(),
        subject: Joi.string().required(),
        gender: Joi.string().required(),
        address: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.number().required(),
        username: Joi.string().optional(),
        password: Joi.string().optional(),
        additionalInfo: Joi.string().required(),
        district: Joi.string().required(),
    }).required(),
})