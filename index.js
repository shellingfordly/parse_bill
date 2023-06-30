const fs = require("fs");
const csv = require("csv-parser");
const json2xls = require("json2xls");

// 解析
const readCSV = (path) => {
  return new Promise((resolve, rejects) => {
    const results = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        rejects(error);
      });
  });
};

const KeyMap = {
  "------------------------------------------------------------------------------------":
    "日期",
  _1: "分类",
  _4: "备注",
  _5: "类型",
  _6: "金额",
  _7: "账户",
};

function parseBill(list) {
  const result = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const json = {};
    for (const key in KeyMap) {
      json[KeyMap[key]] = key == "_1" ? item[key].slice(0, 2) : item[key];
    }
    result.push(json);
  }

  return result;
}

(async function () {
  // 支付宝账单
  const alipayList = await readCSV(`./csv/alipay.csv`);
  //解析
  const json = parseBill(alipayList.slice(24));
  // 导出
  const xls = json2xls(json);
  fs.writeFileSync("./xls/alipay.xls", xls, "binary");
})();
