const express = require('express');

const { InfoController } = require('../../controllers');
const BookingRoutes=require('./Booking-routes');

const router = express.Router();

router.get('/info', InfoController.info);
router.use('/bookings',BookingRoutes);

module.exports = router;