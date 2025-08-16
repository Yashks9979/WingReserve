const amqplib=require('amqplib');

let channel,connection;

async function connectQueue(){
    try {
         connection=await amqplib.connect("amqp://localhost");
         channel=await connection.createChannel();
        await  channel.assertQueue("noti-queue");
    } catch (error) {
        console.log(error);
    }
}

async function sendData(data){
    try {
        await channel.sendToQueue("noti-queue",Buffer.from(JSON.stringify(data)));//we can only send either
                                                                                //string ,array or buffer
    } catch (error) {
        console.log(error);
    }
}

module.exports={
    connectQueue,
    sendData
}