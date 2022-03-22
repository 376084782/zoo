import Util from "../Util";
import socketManager from "..";
import _ from "lodash";
import PROTOCLE from "../config/PROTOCLE";
import { HOLE_COUNT } from "../config";
import Hole from "./Hole";
import ModelConfig from "../../models/ModelConfig";
import ModelConfigRoom from "../../models/ModelConfigRoom";
import ModelUser from "../../models/ModelUser";
import ModelAnimalType from "../../models/ModelAnimalType";
// 游戏内玩家全部离线的房间，自动清除
export default class RoomManager {
  // 房间等级
  level = 1;
  roomId = 0;
  isPublic = true;
  // 存当前在游戏中的uid列表
  get uidList() {
    return this.userList.map(e => e.uid);
  }
  userList = [];
  holeList: Hole[] = []

  constructor({ level }) {
    this.roomId = Util.getUniqId();
    this.level = level;
    this.initHoles()
  }

  async doClickHole(uid, typeAnimal, confWeapon) {
    let { P, RB, userInfo, diviseWeaponGainAndCost } = await Util.getConfig(uid, this.level, typeAnimal);
    let win = 0;
    let flag = Math.random() < P;
    let configAnimal = await ModelAnimalType.findOne({ id: typeAnimal });
    let cost = Math.floor(confWeapon.mult * RB);
    if (flag) {
      win = Math.floor(configAnimal.mult * confWeapon.mult * RB)
    }
    userInfo.coin += (win - cost)
    userInfo.gainTotal += (win - cost)
    let res = await ModelUser.updateOne({ uid }, {
      coin: userInfo.coin,
      gainTotal: userInfo.gainTotal
    });
    let userInGame = this.userList.find(e => e.uid == uid);
    if (userInGame) {
      userInGame.coin = userInfo.coin;
      userInGame.gainTotal = userInfo.gainTotal;
      socketManager.sendMsgByUidList(this.uidList, PROTOCLE.SERVER.ROOM_USER_UPDATE, {
        userList: this.userList
      });
    }
    return { flag, cost, win, userInfo }

  }
  initHoles() {
    for (let i = 0; i < HOLE_COUNT; i++) {
      let ctr = new Hole();
      ctr.idx = i;
      ctr.roomCtr = this;
      this.holeList.push(ctr);
    }
  }

  // 玩家离开
  leave(uid) {
    socketManager.sendMsgByUidList([uid], PROTOCLE.SERVER.GO_HALL, {});
    this.userList = this.userList.filter(user => user.uid != uid);
    socketManager.sendMsgByUidList(this.uidList, PROTOCLE.SERVER.ROOM_USER_UPDATE, {
      userList: this.userList
    });
  }
  // 玩家加入
  join(userInfo) {
    if (this.uidList.indexOf(userInfo.uid) > -1) {
      socketManager.sendErrByUidList([userInfo.uid], "match", {
        msg: "玩家已经在房间内"
      });
      return false
    }

    this.userList.push(userInfo);
    socketManager.sendMsgByUidList(this.uidList, PROTOCLE.SERVER.ROOM_USER_UPDATE, {
      userList: this.userList
    });
    socketManager.sendMsgByUidList([userInfo.uid],
      PROTOCLE.SERVER.GO_GAME, {
      dataGame: this.getRoomInfo(userInfo.uid)
    });
    return true
  }
  clickHole(uid, holeId, confWeapon) {
    if (this.checkInRoom(uid)) {
      let hole = this.holeList.find((hole: Hole) => hole.idx == holeId);
      if (hole) {
        hole.doClick(uid, confWeapon)
      }
    }
  }

  checkInRoom(uid) {
    return this.uidList.indexOf(uid) > -1;
  }
  // 获取全服房间内游戏数据
  getRoomInfo(uid) {
    let listHole = [];
    this.holeList.forEach((ctr: Hole) => {
      listHole.push({
        isOut: ctr.isOut,
        idx: ctr.idx,
        type: ctr.type
      })
    })
    let info: any = {
      isInRoom: true,
      gameInfo: {
        level: this.level,
        listHole,
        listUser: this.userList
      },
    };
    return info;
  }
}
