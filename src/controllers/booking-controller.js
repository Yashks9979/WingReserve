const { StatusCodes } = require('http-status-codes');
const {BookingService}=require('../services');
const {SuccessResponse,ErrorResponse}=require('../utils/common');
const redis=require('../config/redis-config');

async function createBooking(req,res){
    try {

        const response=await BookingService.createBooking({
            flightId:req.body.flightId,
            userId:req.body.userId,
            noOfSeats:req.body.noOfSeats
        });
        console.log(response);
        SuccessResponse.data=response;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error=error;
        return res.status(error.statusCode || StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
}

async function makePayment(req,res){
    try {
        
        const idempotencyKey=req.headers['x-idempotency-key'];
        const cachedData = await redis.get(idempotencyKey);
        if(!idempotencyKey){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:'idempotency key is missing'
            });
        }
        if(cachedData!=null){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:'cannot retry on successfull payment'
            });
        }

       //just pass the parameter by looking what all data service just required>>>not repository repository parameter will be bhandled by service layers
        const response=await BookingService.makePayment({
           bookingId:req.body.bookingId,
           userId:req.body.userId,
           totalCost:req.body.totalCost
        });
        await redis.set(idempotencyKey,idempotencyKey);

        console.log(response);
        SuccessResponse.data=response;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error=error;
        return res.status(error.statusCode || StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
}
module.exports={
    createBooking,
    makePayment
}