const http = require("http");
import ModelConfig from "../models/ModelConfig";
import ModelConfigRoom from "../models/ModelConfigRoom";
import ModelUser from "../models/ModelUser";
import ModelAnimalType from "../models/ModelAnimalType";
export default class Util {
  static async getConfig(uid, roomLev) {
    let configBasic = await ModelConfig.findOne({});
    let configRoom = await ModelConfigRoom.findOne({ id: roomLev });
    let userInfo = await ModelUser.findOne({ uid: uid });
    let listAP = JSON.parse(configRoom.AP);
    let AP = 0;
    let PA = configBasic.PA;
    let ZH = configBasic.ZH;
    let TP = configBasic.TP;
    let RP = configRoom.RP;
    let PG = configRoom.PG;
    let ZG = configRoom.ZG;
    let BP = 0;
    for (let i = 0; i < listAP.length; i++) {
      let configAP = listAP[i];
      let biggerThanMin = configAP.min == null || userInfo.gainTotal >= configAP.min;
      let smallerThanMax = configAP.max == null || userInfo.gainTotal < configAP.max;
      if (smallerThanMax && biggerThanMin) {
        AP = configAP.AP;
      }
    }
    if (userInfo.isInBlackRoom) {
      BP = configBasic.BP;
    }

    let P = ((PA / ZH) * 100 + TP + RP + AP + BP)/100;
    if (P < 0) {
      P = 0
    }
    let IR = (PG / ZG) * (1 / P);
    return {
      PA, ZH, TP, RP, BP, P, IR, PG, ZG, AP, userInfo: {
        coin: userInfo.coin,
        gainTotal: userInfo.gainTotal,
        isInBlackRoom: userInfo.isInBlackRoom,
        uid: uid,
        nickname: userInfo.nickname,
        avatar: userInfo.avatar,
      }
    };
  }
  static id = 1;
  static getUniqId() {
    this.id++;
    return this.id;
  }
  static getRandom(from, to) {
    return from + Math.floor(Math.random() * (to - from));
  }
  static removeFromArr(arr, item) {
    let idx = arr.indexOf(item);
    if (idx > -1) {
      arr.splice(idx, 1);
    }
  }
  static doAjax(url) {
    return new Promise((rsv, rej) => {
      http.get(url, data => {
        var str = "";
        data.on("data", function (chunk) {
          str += chunk; //监听数据响应，拼接数据片段
        });
        data.on("end", function () {
          // console.log(str, url)
          try {
            data = JSON.parse(str);
          } catch (err) { }
          rsv(data);
        });
      });
    });
  }
  static shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }
  static getRandomInt(min: number = 0, max: number = 1): number {
    return Math.floor(Math.random() * (max - min) + min);
  }
}
