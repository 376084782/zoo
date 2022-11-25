import socketManager from "..";
import ModelAnimalType from "../../models/ModelAnimalType";
import ModelConfig from "../../models/ModelConfig";
import PROTOCLE from "../config/PROTOCLE";
import Util from "../Util";
import RoomManager from "./RoomManager";

export default class Hole {
  roomCtr: RoomManager;
  isOut = false;
  idx = 0;
  type = 0;
  constructor() {
    this.initShow()
  }
  crazyId = -1;
  initShow() {
    ModelConfig.findOne({}).then(configBasic => {
      this.doTimer(() => {
        this.doOut()
      }, configBasic.PL * Math.random());
    })
  }
  doShowCrazy(duration, idAniType) {
    this.doDown(0, false);
    setTimeout(() => {
      this.crazyId = idAniType;
      this.doOut(false, idAniType);
      setTimeout(() => {
        this.doDown(0, false);
        setTimeout(() => {
          this.crazyId = -1;
          this.initShow()
        }, 500);
      }, duration)
    }, 500)
  }
  doTimer(func, time,) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      func()
    }, time);
  }
  timer = null;
  async doOut(autoHide = true, idAniType = 0) {
    if (this.crazyId > -1) {
      idAniType = this.crazyId;
    }
    let configBasic = await ModelConfig.findOne({});
    clearTimeout(this.timer);
    if (idAniType == 0) {
      let list = await ModelAnimalType.find({
        canInHole: {
          $in: [this.idx]
        }
      });
      let listTarget = [];
      list.forEach(conf => {
        for (let i = 0; i <= conf.power; i++) {
          listTarget.push(conf.id);
        }
      })
      let i = Util.getRandomInt(0, listTarget.length);
      this.type = listTarget[i];
    } else {
      this.type = idAniType
    }
    this.isOut = true;
    socketManager.sendMsgByUidList(this.roomCtr.uidList, PROTOCLE.SERVER.HOLE_UP, { type: this.type, idx: this.idx })
    if (autoHide) {
      this.doTimer(() => {
        this.doDown()
      }, configBasic.TO);
    }
  }
  async doDown(reason = 0, autoShow = true) {
    let configBasic = await ModelConfig.findOne({});
    clearTimeout(this.timer);
    this.isOut = false;
    socketManager.sendMsgByUidList(this.roomCtr.uidList, PROTOCLE.SERVER.HOLE_DOWN, { idx: this.idx, reason })
    if (autoShow) {
      this.doTimer(() => {
        this.doOut()
      }, reason == 1 ? 1000 + Math.random() * 1000 : configBasic.PL * (1 + .5 * Math.random()))
    }
  }
  async doClick(uid, confWeapon) {
    if (!this.isOut) {
      return
    }
    let { flag, cost, win } = await this.roomCtr.doClickHole(uid, this.type, confWeapon);
    socketManager.sendMsgByUidList(this.roomCtr.uidList, PROTOCLE.SERVER.HIT_COST, {
      uid,
      cost: cost,
      idx: this.idx, confWeapon
    })
    if (flag) {
      this.doDown(1)
      socketManager.sendMsgByUidList(this.roomCtr.uidList,
        PROTOCLE.SERVER.HIT_RESULT,
        {
          uid,
          idx: this.idx,
          flag: true,
          win: win
        })
    }
  }
}