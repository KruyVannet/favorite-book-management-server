'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
const cron = require('node-cron');

// schedule to update all books to private
cron.schedule('0 * * * *', async (ctx) => {
  try {
    const bookList = await strapi.query('book').model.aggregate([
      {$match: {isPublic: true}},
    ]);

    for (const book of bookList) {
      await strapi.query('book').update(
        { _id: book._id },
        { isPublic: false }
      );
    }
    console.log('update all books status success');
  } catch (e) {
    console.log('update all books status fail!');
  }
});
module.exports = {
};
