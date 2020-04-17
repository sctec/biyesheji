/**
 * 所有省份的数据
 */

const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const Json2csvParser = require('json2csv').Parser;
const DB = require("../model/db");


async function getData() {
  let allProvinceData = [];
  await axios.get("https://ncov.dxy.cn/ncovh5/view/pneumonia")
    .then((res) => {
      const $ = cheerio.load(res.data);
      let originData = $('#getAreaStat').html();
      let data = {};
      eval(originData.replace(/window/g, 'data'));
      allProvinceData = data.getAreaStat;
    })
    .catch((err) => {
      return err;
    });
  let provinces = [];
  for (let item of allProvinceData) {
    provinces.push(item.provinceName);
  }
  console.log(provinces);
  //导入数据库
  try {
    let exist = await DB.find("allProvinceData", {});
    if (exist.length !== 0) {
      await DB.deleteMany("allProvinceData");
      await DB.insertMany("allProvinceData", allProvinceData);
    } else {
      await DB.insertMany("allProvinceData", allProvinceData);
    }
  } catch (e) {
    console.log(e);
  }


  //导出至CSV文件中
  //去除了comment字段和cities字段。
  const fields = ["provinceName", "provinceShortName", "currentConfirmedCount", "confirmedCount", "suspectedCount", "curedCount", "deadCount", "locationId", "statisticsData"];
  const json2csvParser = new Json2csvParser({fields});
  const csv = json2csvParser.parse(allProvinceData);
  fs.writeFile('../csv/allProvinceData.csv', csv, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("导出成功");
    }
  });
}

getData();