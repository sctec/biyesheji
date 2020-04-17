const cheerio = require("cheerio");
const axios = require("axios");
const DB = require("../model/db");
const fs = require("fs");
const Json2csvParser = require('json2csv').Parser;

(async function search() {
    try {
        let result = await DB.find("allProvinceData", {});
        for (let item of result) {
            //如果不能识别中文，更换为item.
            let exist = await DB.find(item.provinceName, {});
            if (exist.length !== 0) {
                await DB.deleteMany(item.provinceName);
                await DB.insertMany(item.provinceName, item.cities);
            } else {
                await DB.insertMany(item.provinceName, item.cities);
            }

            //导出csv
            const fields = ["cityName", "currentConfirmedCount", "confirmedCount", "suspectedCount", "curedCount", "deadCount", "locationId"];
            const json2csvParser = new Json2csvParser({fields});
            const csv = json2csvParser.parse(item.cities);
            fs.writeFile(`../csv/${item.provinceName}.csv`, csv, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("导出成功");
                }
            });
        }
    } catch (e) {
        console.log(e);
    }
})();