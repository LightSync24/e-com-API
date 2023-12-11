import { MongoClient } from 'mongodb';
import {
  ObjectId
} from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    '$group': {
      '_id': '$product', 
      'averageRating': {
        '$avg': '$rating'
      }, 
      'numOfReviews': {
        '$sum': 1
      }
    }
  }, {
    '$match': {
      'product': new ObjectId('65758f5aa8d30dccc48dd08c')
    }
  }
];

const client = await MongoClient.connect(
  '',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const coll = client.db('10-E-COM-API').collection('reviews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();