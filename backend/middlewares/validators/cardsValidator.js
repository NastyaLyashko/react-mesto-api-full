const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const mongoose = require('mongoose');

const postCardValidator = celebrate({
    body: {
        name: Joi.string().required().message({
            'any.required': 'Обязательное поле'
        }),
        link: Joi.string().required().custom((value, helper)=>{
            if(validator.isURL(value)) {
                return value
            }
            return helper.message('Невалидная ссылка')
        }).message({
            'any.required': 'Обязательное поле'
        }),
    }
})

const cardIdValidator = celebrate({
    params: {
        _id: Joi.string().required().custom((value, helper)=>{
            if(mongoose.Types.ObjectId.isValid(value)) {
                return value
            }
            return helper.message('Такой карточки нет')
        })
    }
})

module.exports = {
    postCardValidator,
    cardIdValidator
}