/**
 * name : models/notificationTemplate/query
 * author : Aman Gupta
 * Date : 06-Dec-2021
 * Description : Notification template database operations
 */

 const NotificationTemplate = require('./model');

 module.exports = class NotificationTemplateData {
 
     static findOneEmailTemplate(filter) {
         return new Promise(async (resolve, reject) => {
             try {
                 const templateData = await NotificationTemplate.findOne(filter).lean();
                 resolve(templateData);
             } catch (error) {
                 reject(error);
             }
         })
     }
 }