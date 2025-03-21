class ExpressError extends Error{
    constructor(statusCode, messsage){
        super();
        this.statusCode = statusCode;
        this.messsage = messsage;
    }
}

module.exports = ExpressError;