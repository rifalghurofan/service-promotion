'use strict';

module.exports = {
  up: (models, mongoose) => {
    /*
      refer to mongoose docs on how to alter a model's schema
    */
  },

  down: (models, mongoose) => {
    /*
      undoing schema alteration
    */
  }
};

// 'use strict'
// const Bluebird = require('bluebird')
// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
// const url = 'mongodb://localhost/Sample'
// Bluebird.promisifyAll(MongoClient)
// module.exports.up = next => {
//   let mClient = null
//   return MongoClient.connect(url).then(client => {
//     mClient = client
//     return client.db();
//   }).then(db => {
//     const User = db.collection('users')
//     return User.find({ lastName: { $exists: false } }).forEach(result => {
//       if (!result)
//         return next('All docs have lastName')
//       if (result.name) {
//         const { name } = result
//         result.lastName = name.split(' ')[1]
//         result.firstName = name.split(' ')[0]
//       } return db.collection('users').save(result)
//     })
//   }).then(() => {
//     mClient.close()
//     return next()
//   }).catch(err => next(err))
// }

