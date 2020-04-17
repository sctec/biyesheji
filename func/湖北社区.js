/**
 * 获取湖北省所有的市
 * 1.先获取湖北省所有的市，存为allCity数据集
 * 2.根据allCity数据集中的城市，为每个城市新建数据集，对每个城市的页面和接口进行爬取，将爬取到的社区存入对应的表中。代码：hubeiDetail.js。
 * 3.遍历allCity数据集中的城市，遍历城市中的每个区，遍历每个区中的社区，获取社区主页的链接.根据主页爬取对应的人口数据。代码：getCount.js。
 */

/**
 * 4.15注：此文件不需要再执行了
 */
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const Json2csvParser = require('json2csv').Parser;
const DB = require("../model/db2");

let resultArr = [];
axios.get("http://cms.cncn.org.cn/api/map_province_index.php?pid=17").then(
).then(res => {
  let data = res.data.map_list[0].province_items;
  for (let item in data) {
    let city_id = data[item].city_id;
    let city_name = data[item].city_name;
    let jsonCity = {};
    jsonCity.city_id = city_id;
    jsonCity.city_name = city_name;
    resultArr.push(jsonCity);
  }
  return Promise.resolve(resultArr);
}).then(async data => {
  let isDB = await DB.find("allCity", {});
  //如果数据集不为空，则不用再次重新存取。
  if (!isDB) {
    let resDB = await DB.insertMany("allCity", data);
  } else {
    console.log("数据已存在");
  }
}).catch(err => {
});
