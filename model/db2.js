//db.js
//DB库
const MongoDB = require('mongodb');
const MongoClient = MongoDB.MongoClient;
const ObjectID = MongoDB.ObjectID;

const Config = require('./config2.js');

class Db {
  static getInstance() {   /*1、单例：实现多次实例化实例共享*/
    if (!Db.instance) {
      Db.instance = new Db();//执行构造方法
    }
    return Db.instance;
  }

  constructor() {
    this.dbClient = ''; /*属性 放db对象*/
    this.connect();   /*实例化的时候就连接数据库*/
  }

  connect() {  /*连接数据库*/
    let _that = this;
    return new Promise((resolve, reject) => {
      if (!_that.dbClient) {         /*1、解决数据库多次连接的问题*/
        MongoClient.connect(Config.dbUrl, (err, client) => {
          if (err) {
            reject(err)
          } else {
            _that.dbClient = client.db(Config.dbName);
            resolve(_that.dbClient);
          }
        })
      } else {
        resolve(_that.dbClient);
      }
    })
  }

  find(collectionName, json1, json2, json3) {
    if (arguments.length == 2) {
      var attr = {};
      var slipNum = 0;
      var pageSize = 0;

    } else if (arguments.length == 3) {
      var attr = json2;
      var slipNum = 0;
      var pageSize = 0;
    } else if (arguments.length == 4) {
      var attr = json2;
      var page = json3.page || 1;
      var pageSize = json3.pageSize || 20;
      var slipNum = (page - 1) * pageSize;

      if (json3.sortJson) {
        var sortJson = json3.sortJson;
      } else {
        var sortJson = {}
      }


    } else {
      console.log('传入参数错误')
    }
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        //var result=db.collection(collectionName).find(json);
        var result = db.collection(collectionName).find(json1, {fields: attr}).skip(slipNum).limit(pageSize).sort(sortJson);
        result.toArray(function (err, docs) {
          if (err) {
            reject(err);
            return;
          }
          resolve(docs);
        })

      })
    })
  }

  update(collectionName, json1, json2) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        //db.user.update({},{$set:{}})
        db.collection(collectionName).updateOne(json1, {
          $set: json2
        }, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        })

      })

    })

  }

  insert(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).insertOne(json, function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        })
      })
    })
  }

  insertMany(collectionName, arr) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        if (arr.length === 0) {
          db.collection(collectionName).insertOne({}, function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          })
        } else {
          db.collection(collectionName).insertMany(arr, function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          })
        }
      })
    })
  }


  remove(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).deleteOne(json, function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        })
      })
    })
  }

  deleteMany(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).deleteMany(json, function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        })
      })
    })
  }

  getObjectId(id) {    /*mongodb中_id为ObjectID类型，需要将得到 字符串 转化为 ObjectId 值*/
    return new ObjectID(id);
  }

  count(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        let result = db.collection(collectionName).count(json);
        result.then((count) => {
          resolve(count)
        })
      })
    })
  }
}

module.exports = Db.getInstance();
