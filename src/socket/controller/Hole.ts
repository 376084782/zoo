import socketManager from "..";
import { PL, TO } from "../config";
import PROTOCLE from "../config/PROTOCLE";
import Util from "../Util";
import RoomManager from "./RoomManager";

export default class Hole {
  roomCtr: RoomManager;
  isOut = false;
  idx = 0;
  type = 0;
  constructor() {
    this.doTimer(() => {
      this.doOut()
    }, PL * Math.random());
  }
  doTimer(func, time,) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      func()
    }, time);
  }
  timer = null;
  doOut() {
    clearTimeout(this.timer);
    this.type = Util.getRandomInt(1, 5);
    this.isOut = true;
    socketManager.sendMsgByUidList(this.roomCtr.uidList, PROTOCLE.SERVER.HOLE_UP, { type: this.type, idx: this.idx })
    this.doTimer(() => {
      this.doDown()
    }, TO);
  }
  doDown() {
    clearTimeout(this.timer);
    this.isOut = false;
    socketManager.sendMsgByUidList(this.roomCtr.uidList, PROTOCLE.SERVER.HOLE_DOWN, { idx: this.idx })
    this.doTimer(() => {
      this.doOut()
    }, PL * (1 + .5 * Math.random()))
  }
  async doClick(uid) {
    if (!this.isOut) {
      return
    }
    let { flag, cost, win } = await this.roomCtr.doClickHole(uid, this.type);
    socketManager.sendMsgByUidList(this.roomCtr.uidList, PROTOCLE.SERVER.HIT_COST, {
      uid,
      cost: cost,
      idx: this.idx,
    })
    if (flag) {
      this.doDown()
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