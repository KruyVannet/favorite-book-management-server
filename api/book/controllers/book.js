'use strict';
const _ = require('lodash');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controllers
 */

module.exports = {
  async getBookListController(ctx){

    let {limit, next} =  ctx.params;
    let query = ctx.query;

    limit = Number(limit);
    next = Number(next);

    let filter = [];
    if(query.hasOwnProperty('title')){
      filter.push(
        {$match: {title: {$regex: query.title, $options: 'i'}},}
      );
    }
    if(query.hasOwnProperty('startDate') && query.hasOwnProperty('endDate') ){
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      filter.push({$match: {
          $and: [
            {publishDate: {$gte: startDate}},
            {publishDate: {$lte: endDate}},
          ]
        }});
    }
    if(query.hasOwnProperty('minCost') && query.hasOwnProperty('maxCost') ){
      const minCost = Number(query.minCost);
      const maxCost = Number(query.maxCost);
      filter.push( {$match:  {
          cost: {
            $gte: minCost ,
            $lte: maxCost
          },
        }});
    }

    const bookList = await strapi.query('book').model.aggregate([
      ...filter,
      {$skip: next},
      {$limit: limit},
      {$sort:{createdAt: -1}}
      ]);
    return {data: bookList};
  },

  async getBookByIdController(ctx){

    const {id} = ctx.params;
    try {
      return  await strapi.query('book').findOne({_id: id});
    }catch(e){
      return ctx.notFound('book not found!');
    }

  },

  async createBookController(ctx){

    let {body} = ctx.request;

    // validate
    if (_.isEmpty(body.title)) { return ctx.badRequest('title is required'); }
    if (_.isEmpty(body.isnb)) { return ctx.badRequest('isnb is required'); }
    if (_.isEmpty(body.authorId)) { return ctx.badRequest('authorId is required'); }
    try{
      const author =  await  strapi.query('author').findOne({_id: body.authorId});
      if(!_.isEmpty(author._id)){
        body.authorId = author._id.toString();
      } else{
        return ctx.badRequest('authorId is invalid');
      }
    } catch (e) {
      return ctx.badRequest('authorId is invalid');
    }

    //create
    try{
      await strapi.query('book').create(body);
      return 1;
    }catch (e) {
      return ctx.badRequest('fail to create book');
    }
  },
  async updateBookController(ctx){

    const {id} = ctx.params;
    let {body} = ctx.request;

    // validate
    if (body.hasOwnProperty('title') && _.isEmpty(body.title.trim())) { return ctx.badRequest('title is can not empty'); }
    if (body.hasOwnProperty('isnb') && _.isEmpty(body.isnb.trim())) { return ctx.badRequest('isnb is can not empty'); }
    if (body.hasOwnProperty('authorId') && _.isEmpty(body.authorId.trim())) { return ctx.badRequest('authorId is can not empty'); }
    try{
      const book =  await  strapi.query('book').findOne({_id: id});
      if (_.isEmpty(book._id)) {
        return ctx.badRequest('book not found');
      }
      try {
        const author = await strapi.query('author').findOne({_id: body.authorId});
        if (!_.isEmpty(author._id)) {
          body.authorId = author._id.toString();
        }
      }catch (e) {
        return ctx.badRequest('authorId is invalid');
      }
    } catch (e) {
      return ctx.badRequest('book not found');
    }

    //update
    try{
      await strapi.query('book').update({_id: id},body);
      return 1;
    }catch (e) {
      return ctx.badRequest('update book fail');
    }
  },
   async deleteBookController(ctx){
     const {id} = ctx.params;
     try{
       const book =  await  strapi.query('book').findOne({_id: id});
       if(!_.isEmpty(book._id)){
         try {
           await strapi.query('book').delete({_id: book._id});
           return 1;
         }catch (e) {
           return ctx.badRequest('fail to delete book');
         }
       }
       else{
         return ctx.badRequest('book not found');
       }
     } catch (e) {
       return ctx.badRequest('book not found');
     }
   },
  //set to public
  async updateBookStatusController(ctx){

    const {id} = ctx.params;

    try{
      const book =  await  strapi.query('book').findOne({_id: id});
      if (_.isEmpty(book._id)) {
        return ctx.badRequest('book not found');
      }
      try {
        await  strapi.query('book').update({_id:id},{isPublic:true});
        return 1;
      }catch (e) {
        return ctx.badRequest('fail to update book status');
      }
    } catch (e) {
      return ctx.badRequest('book not found');
    }
  },
  async getPublicBookController(ctx){

    let {limit, next} =  ctx.params;

    limit = Number(limit);
    next = Number(next);

    const bookList = await strapi.query('book').model.aggregate([
      {$match: {isPublic: true}},
      {$skip: next},
      {$limit: limit},
      {$sort:{createdAt: -1}}
    ]);
    return {data: bookList};
  }

};
