const moment = require("moment-timezone");
const common = require('../../constants/common');

const sessionData = require("../../db/sessions/queries");
const sessionAttendesData = require("../../db/sessionAttendees/queries");

const notificationData = require("../../db/notificationTemplates/queries");

const utils = require('../../generics/utils');
const userProfile = require("./userProfile");

const kafkaCommunication = require('../../generics/kafka-communications');

module.exports = class SessionsHelper {

    static async sendNotificationBefore24Hour() {

        let minutesFor24Hour = 1440;
    
        let data = await sessionData.findSessions({
            status: "published",
            deleted:false
        });

        let filter = {
            code: "mentor_session_enrollment",
            type: 'email',
            deleted: false,
            status: 'active',
        }
        let emailTemplate = await notificationData.findOneEmailTemplate(filter);

        if (data && data.length > 0) {
            data.forEach(async function(session) {

                if (session.startDateUtc) {
                    let currentDate = moment();
                    if (session && session.timeZone) {
                        currentDate.tz(session.timeZone);
                    }
                    let elapsedMinutes = moment(session.startDateUtc).diff(currentDate, 'minutes');

                    if(elapsedMinutes = minutesFor24Hour){

                    }
                    let userData = await userProfile.details("",session.userId);
                 
                    if(userData && userData.data && userData.data.result){

                        emailTemplate.body = emailTemplate.body.replace("{sessionTitle}",session.title);
                        emailTemplate.body = emailTemplate.body.replace("{name}",userData.data.result.name);

                        const payload = {
                            type: 'email',
                            email: {
                                to: userData.data.result.email,
                                subject: emailTemplate.subject,
                                body: emailTemplate.body
                            }
                        };
            
                        await kafkaCommunication.pushToKafka(payload);
                    }
                  
                //    console.log(emailTemplate.body,"currentDate",elapsedMinutes, "elapsedMinutes", minutesFor24Hour);
                }
            });

        }



    }
}