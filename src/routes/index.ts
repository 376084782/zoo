import API from "../api/API";
import AgoraTokenGenerater from "../api/AgoraTokenGenerater";
import Util from "../socket/Util";

var express = require("express");
var router = express.Router();
/* GET home page. */
router.post("/proxy", async (req, res, next) => {
  let data = req.body;
  let data2: any = await API.doAjax({
    url: data.url,
    method: data.method,
    data: data.data
  });
  res.send(data2);
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
