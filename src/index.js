const express = require('express');


const { ServerConfig,Queue } = require('./config');
const apiRoutes = require('./routes');
const CRON=require('./utils/common/cron-jobs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.text());

app.use('/api', apiRoutes);
app.use('/bookingsService/api',apiRoutes);

app.listen(ServerConfig.PORT,async() => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    CRON.scheduleCrons();
    await Queue.connectQueue();//DO try without async and try with direct json object in config/queue-config>>
    console.log("queue connected");
});
