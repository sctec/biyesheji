const Koa = require("koa");
const router = require("koa-router")();
const cheerio = require("cheerio");
const superagent = require("superagent");
const app = new Koa();

let url = "https://news.baidu.com/";
let hotNews = [];
// let getHotNews = (res) => {
//     let result = [];
//     let $ = cheerio.load(res.text);
//     $("div#pane-news ul li a").each((index, element) => {
//         let news = {
//             title: $(element).text(),
//             href: $(element).attr('href')
//         };
//         result.push(news);
//     });
//     return result;
// };
superagent.get(url).end((err, res) => {
    if (err) {
        console.log(`失败 ${err}`);
    } else {
        hotNews = res.text;
    }
});

router.get("/", async (ctx, next) => {
    console.log(hotNews);
    ctx.body = hotNews;
});


app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
