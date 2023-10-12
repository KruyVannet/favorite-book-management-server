const _ = require('lodash');
const bcrypt = require('bcryptjs');

module.exports = {
  registerUserService: async(ctx, createData) => {

    if (createData.proType) {
      if (createData.proType === 'admin') {
        const adminRole = await strapi.query('role', 'users-permissions').findOne({type: 'admin'});
        if (adminRole) { createData.role = adminRole._id; }
      } else {
        const userRole = await strapi.query('role', 'users-permissions').findOne({type: 'authenticated'});
        if (userRole) { createData.role = userRole._id; }
      }
    }

    if (createData.email) {
      const user = await strapi.query('user', 'users-permissions').findOne({email: createData.email});
      if (user) {
          return {
            statusCode: 400,
            error: 'bad request',
            message:'email is already used',
          };
      }
    }
    createData.password = await  bcrypt.hash(createData.password, 10);

    return await strapi.query('user', 'users-permissions').create(createData);
  },
};
