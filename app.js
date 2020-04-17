const Koa = require("koa");
const router = require("koa-router")();
const cheerio = require("cheerio");
const axios = require("axios");
const app = new Koa();
let data = [];
axios.get("http://data.stats.gov.cn/easyquery.htm?m=QueryData&dbcode=hgnd&rowcode=zb&colcode=sj&wds=%5B%5D&dfwds=%5B%7B%22wdcode%22%3A%22zb%22%2C%22valuecode%22%3A%22A0301%22%7D%5D&k1=1584976414734&h=1")
    .then((res) => {
        // let $ = cheerio.load(res.data);
        // // console.log(res.data);
        // data = $(".mr-content").html();
        data = res.data;
        // console.log(res.data);
    })
    .catch((err) => {
        console.log(err);
    });


// routers.get("/", async (ctx, next) => {
//     ctx.body = data;
// });

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3001);