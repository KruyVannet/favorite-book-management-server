const _ = require('lodash');

module.exports = {

  async registerUserController (ctx){

    const createData = ctx.request.body;

    const userService = strapi.plugins['users-permissions'].services.user;

    return await userService.registerUserService(ctx, createData);

  },

  async loginWithEmailController(ctx) {

    const userService = strapi.plugins['users-permissions'].services.user;
    const jwtService = strapi.plugins['users-permissions'].services.jwt;

    const {email, password} = ctx.request.body;


    if (_.isEmpty(email) || _.isEmpty(password)) {
      return ctx.response.badRequest('Invalid email or password!');;
    }

    const validEmailUser = await strapi.query('user', 'users-permissions').findOne({email: email.trim()});

    if (!validEmailUser) { return ctx.response.badRequest('Invalid email!'); }
    if (!['admin', 'direction', 'manager','authenticated'].includes(validEmailUser.role.type)) {
      return ctx.response.badRequest('Invalid email!');
    }

    const isValidPassword = await userService.validatePassword(password, validEmailUser.password);
    if (!isValidPassword) { return ctx.response.badRequest('Invalid password!'); }


    // issue token, return
    const jwt = jwtService.issue({id: validEmailUser.id.toString()}, {expiresIn: '1d'});
    // calculate field
    delete validEmailUser.password;

    return {jwt, user: validEmailUser};
  },
}
