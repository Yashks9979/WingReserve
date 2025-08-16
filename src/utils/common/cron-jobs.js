const cron=require('node-cron');
const {BookingService}=require('../../services');
const redis = require('../../config/redis-config');
 function scheduleCrons(){
    cron.schedule('*/15 * * * *',async ()=>{
           const response=await BookingService.cancelOldBookings();
            console.log("hello from CRON",response);
            await redis.flushdb(); 
            redis.dbsize((err, reply) => {
                if (err) {
                    console.error('Error getting the number of keys:', err);
                } else {
                    console.log('Number of keys in Redis:', reply);
                    if (reply === 0) {
                        console.log('Redis cache is empty');
                    } else {
                        console.log('Redis cache is not empty');
                    }
                }
            });
    });
}

module.exports={
    scheduleCrons
}

//idk sanskar-03:05-8448
//$ winpty docker run --name redis-server -it redis:latest
