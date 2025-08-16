const axios=require('axios');
const {ServerConfig,Queue}=require('../config/index');
const {BookingRepository}=require('../repositories');
const db=require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');


const ENUMS=require('../utils/common/enum');
const {BOOKED,CANCELLED,PENDING,INITIATED}=ENUMS.BOOKING_STATUS;

const bookingRepository=new BookingRepository();

async function createBooking(data){
    const transaction=await db.sequelize.transaction();
    try {
        const flight=await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData=flight.data.data;//why????
        if(data.noOfSeats>flightData.totalSeats){
             throw new AppError('Not enough seats available',StatusCodes.BAD_REQUEST);
        }
        console.log('total seat',data.noOfSeats)
        const totalBillingAmount=data.noOfSeats*flightData.price;
         console.log(totalBillingAmount);

         const bookingPayload={...data,totalCost:totalBillingAmount};///(...data) is spread operator it copies all data of data object all at once>> 
        
         const booking=await  bookingRepository.create(bookingPayload,transaction);
          
         await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
            seats:data.noOfSeats
         })
      
         await transaction.commit();
        return booking;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }

}

async function makePayment(data){
    const transaction=await db.sequelize.transaction();
    try {
        const bookingDetails=await bookingRepository.get(data.bookingId,transaction);
        if(bookingDetails.status==CANCELLED){
            throw new AppError('Booking has already expired',StatusCodes.BAD_REQUEST);
        }
        const bookingTime=new Date( bookingDetails.createdAt);
        const currentTime=new Date();
        if(currentTime-bookingTime>300000 && bookingDetails.status!='booked'){
            await cancelBooking(data.bookingId);
            throw new AppError('Booking has expired',StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.totalCost!=data.totalCost){
            throw new AppError('Billing amount did not match',StatusCodes.BAD_REQUEST);
        }
        //if while fetching data from repository fails then it will directly throw error>>
        if(bookingDetails.userId!=data.userId){
            throw new AppError('userId did not match',StatusCodes.BAD_REQUEST);   
        }
       //we assume that payment is successfull>>>
        const response=await bookingRepository.update(data.bookingId,{status:BOOKED},transaction);
        await Queue.sendData({
            recepientEmail:'sanskarsingh812@gmail.com',
            subject:'Flight booked',
            text:`booking successfully done for flight for booking id ${data.bookingId}`
        });
      
        await transaction.commit();

        console.log("from service",response);
     
        return response;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
//doubt in>> how we are binding transaction together and how they are working as together wholesome>>

async function cancelBooking(bookingId){
    const transaction=await db.sequelize.transaction();
    try {
        const bookingDetails=await bookingRepository.get(bookingId,transaction);
        if(bookingDetails.status==CANCELLED){
            await transaction.commit();
            return true;
        }
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
            seats:bookingDetails.noOfSeats,
            dec:0
         });
         await bookingRepository.update(bookingId,{status:'CANCELLED'},transaction);
         await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBookings(){
  try {
    const time=new Date(Date.now()-1000*300);//time 5 min ago>>
    const response=await bookingRepository.cancelOldBookings(time);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
module.exports={
    createBooking,
    makePayment,
    cancelBooking,
    cancelOldBookings
}