const {StatusCodes}=require('http-status-codes');

const {Booking}=require('../models');
const CrudRepository = require('./crud-repository');
const AppError = require('../utils/errors/app-error');
const {Op}=require('sequelize');
const ENUMS=require('../utils/common/enum');
const {BOOKED,CANCELLED,PENDING,INITIATED}=ENUMS.BOOKING_STATUS;
class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking)
    }

    async createBooking(data,transaction){
        const response=await Booking.create(data,{transaction:transaction});
        return response;
    }

    async get(data,transaction){
        const response=await Booking.findByPk(data,{transaction:transaction});
        if(!response){
            throw new AppError('Not able to find the resources',StatusCodes.BAD_REQUEST);
        }
        return response;
    }

    async update(id,data,transaction){
        const response=await Booking.update(data,{
            where:{
                id:id
            }
        },{transaction:transaction});
        return response;
    }

    async cancelOldBookings(timestamp){
        const response=await Booking.update({status:CANCELLED},{
                where:{
                    [Op.and]:[
                {
                createdAt:{
                        [Op.lte]:timestamp
                    }
                },
                {
                    status:{
                        [Op.ne]:BOOKED
                        }
                },
                {
                    status:{
                        [Op.ne]:CANCELLED
                    }
                }
                    ]
            }
            });
            return response;
        }
}
module.exports=BookingRepository;

//ou can schedule two separate cron jobs using node-cron:

//Every 5 seconds → */5 * * * * *
//Every 10 minutes → */10 * * * *
//Updated cron-jobs.js