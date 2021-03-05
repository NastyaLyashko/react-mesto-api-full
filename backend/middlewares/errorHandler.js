const { CelebrateError } = require('celebrate')

const errorHandler = (err, req, res, next) => {
    if(err instanceof CelebrateError){
        return res.status(400).send({message: err.details.get('body').details[0].message});
    }
    if(err.status){
        return res.status(err.status).send({ message: err.message });
    }

    res.status(500).send({ message: 'На сервере произошла ошибка'})
}; 

module.exports = errorHandler;