import API from "../api/API";
import AgoraTokenGenerater from "../api/AgoraTokenGenerater";

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


module.exports = router;
