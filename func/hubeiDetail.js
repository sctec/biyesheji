const axios = require("axios");
const DB = require("../model/db2");

new Promise(async (resolve, reject) => {
  let resDB = await DB.find("allCity", {});
  for (let item of resDB) {
    let city_id = item.city_id;
    let city_name = ''; //市（武汉市）
    let data = '';
    let district_name = '';
    let district_items = []; //数据清洗

    //获取每一个地级市的所有县区
    await axios.get("http://cms.cncn.org.cn/api/map_city_index.php?cid=" + city_id).then(res => {
      city_name = res.data.map_list[0].city_name;
      data = res.data.map_list[0].city_items;
    });

    //获取一个县区的所有社区
    let districtArr = [];
    let resArr = [];
    for (let item in data) {
      districtArr.push(data[item]);
    }
    for (let item of districtArr) {
      //item-->每一个县级区
      let district_id = item.district_id;


      console.log(district_id);
      await axios.get("http://cms.cncn.org.cn/api/map_district_index.php?&sid=" + district_id)
        .then(async res => {
          let district_num = 0;
          if (res.data.map_list[0].district_items) {
            district_num = res.data.map_list[0].district_items.length;
          }
          //数据清洗
          let resObj = res.data.map_list[0];
          let districtName = resObj.district_name;
          //如果resObj.district_num存在，表明不是第一次插入，则执行更新操作
          if (resObj.district_num) {
            await DB.update(city_name, {district_name: districtName}, {district_num: district_num})
          } else if (district_num !== 0) {
            resObj.district_num = district_num;
            resObj.district_pNum = 0;
            resArr.push(resObj);
          }
        })
    }
    let resFind = await DB.find(city_name, {});
    if (resFind.length === 0) {
      console.log("1");
      let resInsert = await DB.insertMany(city_name, resArr);
    } else {
      await DB.update(city_name, {}, resArr);
    }
  }
}).catch(err => {
  console.log(err);
});