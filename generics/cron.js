// var cors = require("cors");

const schedule = require('node-schedule');
var notiffications = require('../services/helper/notifications');

const job = schedule.scheduleJob('* * * * * *', function(){
    // console.log("end date")

	// cronJobs.deleteData();
	// console.log('The answer to life, the universe, and everything!');

    //  notiffications.sendNotificationBefore24Hour();

});
