import API from "../api/API";
import AgoraTokenGenerater from "../api/AgoraTokenGenerater";
import Util from "../socket/Util";
import ModelAnimalType from "../models/ModelAnimalType";
import ModelUser from "../models/ModelUser";
import ModelConfig from "../models/ModelConfig";
import ModelConfigRoom from "../models/ModelConfigRoom";

var express = require("express");
var router = express.Router();
/* GET home page. */
router.post("/room/save", async (req, res, next) => {
  let data = req.body;
  for (let i = 0; i < data.length; i++) {
    let confEach = data[i];
    if (typeof confEach.AP != 'string') {
      confEach.AP = JSON.stringify(confEach.AP);
    }
    await ModelConfigRoom.updateOne({ id: confEach.id }, {
      RP: confEach.RP,
      PG: confEach.PG,
      ZG: confEach.ZG,
      AP: confEach.AP
    });
  }
  res.send({ code: 0 });
});
router.get("/room/list", async (req, res, next) => {
  let data = req.query;
  let conf: any = await ModelConfigRoom.find({});
  res.send(conf);
});
router.get("/config/basic", async (req, res, next) => {
  let data = req.query;
  let conf: any = await ModelConfig.findOne({});
  res.send(conf);
});
router.post("/config/basic/edit", async (req, res, next) => {
  let data = req.body;
  await ModelConfig.updateOne({}, {
    BP: data.BP,
    PA: data.PA,
    PL: data.PL,
    TO: data.TO,
    TP: data.TP,
    ZH: data.ZH,
  });
  res.send({ code: 0 });
});
router.get("/user/list", async (req, res, next) => {
  let data = req.query;
  let list: any = await ModelUser.find({});
  res.send(list);
});
router.get("/animal/list", async (req, res, next) => {
  let data = req.query;
  let list: any = await ModelAnimalType.find({});
  res.send(list);
});
router.post("/animal/update", async (req, res, next) => {
  let data = req.body;
  await ModelAnimalType.updateOne({ id: data.id }, data);
  res.send({ code: 0 });
});
router.post("/userinfo", async (req, res, next) => {
  let data = req.body;
  let result = (await API.getUserInfo(data.uid)) as any;
  res.send(result);
});

router.get("/config", async (req, res, next) => {
  let data = req.query;
  let result = (await Util.getConfig(data.uid, data.level)) as any;
  res.send({
    code: 0,
    data: result
  });
});

module.exports = router;
