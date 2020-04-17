/**
 *
 * 每个省份每天的数据汇总。
 * 1.导出到数据库中
 * 2.导出为csv文件
 */

const cheerio = require("cheerio");
const axios = require("axios");
const DB = require("../model/db");
const fs = require("fs");
const Json2csvParser = require('json2csv').Parser;

(async function search() {
    try {
        let time = parseInt(new Date().getTime() / 60000);//api接口中的时间戳。
        let result = await DB.find("allProvinceData", {});
        for (let item of result) {
            let url = `${item.statisticsData}?t=${time}`;//item.statisticsData 每个省份自带的接口数据
            let detailJson;
            await axios.get(`${item.statisticsData}`)
                .then((res) => {
                    detailJson = res.data.data;
                })
                .catch((err) => {
                    console.log(err);
                });
            //存入数据库
            let exist = await DB.find(`${item.provinceName}detail`, {});
            if (exist.length !== 0) {
                await DB.deleteMany(`${item.provinceName}detail`);
                await DB.insertMany(`${item.provinceName}detail`, detailJson);
            } else {
                await DB.insertMany(`${item.provinceName}detail`, detailJson);
            }

            //导出csv
            const fields = ["confirmedCount", "confirmedIncr", "curedCount", "curedIncr", "currentConfirmedCount", "currentConfirmedIncr", "dateId", "deadCount", "deadIncr"];
            const json2csvParser = new Json2csvParser({fields});
            const csv = json2csvParser.parse(detailJson);
            fs.writeFile(`../csv/${item.provinceName}detail.csv`, csv, (err) => {
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