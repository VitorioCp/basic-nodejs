class AppError{
    massage;
    statusCode;

    constructor(message, statusCode = 400){
        this.massage = message;
        this.statusCode = statusCode;
    }
}

module.exports = AppError;