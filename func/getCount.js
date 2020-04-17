const axios = require("axios");
const DB = require("../model/db2");
const cheerio = require("cheerio");

// const sleep = require("sleep");

function sleep(d) {
  for (let t = Date.now(); Date.now() - t <= d;) ;
}


new Promise(async (resolve, reject) => {
  let dbCity = await DB.find("allCity", {});
  let cityNameArr = [];
  for (let item of dbCity) {
    let city_name = item.city_name;//武汉市
    //查找该城市下所有的区（江岸区）
    let city = await DB.find(city_name, {});

    //查找区中的所有社区
    for (let i of city) {//i-->江岸区
      //数据清理
      let district_pNum = 0; //统计该行政区下所有的人数
      let district_name = i.district_name;
      let district_items = i.district_items; // district_items --> 社区数组
      let district_items_arr = []; //添加人数后的社区数组
      console.log(district_name);
      if (district_items.length !== 0) {
        for (let dItem of district_items) { //dItem --> 具体的每个社区
          //获取每个社区的链接
          let webUrl = dItem.community_weburl;
          console.log(webUrl);
          //爬取每个社区的介绍页
          await axios.get(webUrl + 'intro.html').then(res => {
            //分析页面，爬取相关数据
            const $ = cheerio.load(res.data);
            let originData = $('.details_content p').text();
            //正则表达式，检索需要的数据——数据清洗
            let reg = /[0-9]+人/;
            let str = originData;
            let regResult = reg.exec(str);
            //若数据为空,进行清洗
            if (regResult) {
              let num = parseInt(regResult);
              district_pNum += num;
              dItem.pnum = num;
              district_items_arr.push(dItem);
            }
            //console.log(res.data);
          }).catch(err => {
            console.log(err);
          });
          sleep(500); //当前方法暂停0.5秒
        }
      }
      let cityUpdate = await DB.update(city_name, {'district_name': district_name}, {"district_items": district_items_arr});
      let cityUpdate2 = await DB.update(city_name, {'district_name': district_name}, {"district_pNum": district_pNum});
    }
  }
});
