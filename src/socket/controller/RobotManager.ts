import socketManager from "..";
import { PEOPLE_EACH_GAME_MAX } from "../config";
import Util from "../Util";
import Hole from "./Hole";
import RoomManager from "./RoomManager";

export default class RobotManager {

  static listRobot: any[] = [{
    uid: 10001,
    nickname: 'robot1',
    avatar: '',
    coin: 10000000
  }, {
    uid: 10002,
    nickname: 'robot2',
    avatar: '',
    coin: 10000000
  }, {
    uid: 10003,
    nickname: 'robot3',
    avatar: '',
    coin: 10000000
  }, {
    uid: 10004,
    nickname: 'robot4',
    avatar: '',
    coin: 10000000
  }, {
    uid: 10005,
    nickname: 'robot5',
    avatar: '',
    coin: 10000000
  }]
  static getRobotUser() {
    let user = this.listRobot.filter((e: any) => !e.isUsed);
    if (user.length > 0) {
      user[0].isUsed = true
      return user[0]
    }
  }

  userInfo: any;
  lev = 0;
  constructor(lev, userInfo) {
    this.lev = lev
    this.userInfo = userInfo;
    this.userInfo.isRobot = true
    this.autoCheckRoom();
  }
  isAlive = true;

  async wait(timeout) {
    return new Promise(rsv => {
      setTimeout(() => {
        rsv(null)
      }, timeout);
    })
  }
  async autoCheckRoom() {
    if (!this.lev || !this.isAlive) {
      return
    }
    let confRoom = socketManager.listRoomConfig.find(e => e.id == this.lev)
    if (confRoom) {
      // 找一个还没有满的房间加入
      let list = socketManager.aliveRoomList.filter((roomCtr: RoomManager) => {
        return (
          roomCtr.level == this.lev &&
          roomCtr.uidList.length < PEOPLE_EACH_GAME_MAX &&
          roomCtr.userList.filter(e => !e.isRobot).length > 0
        );
      });
      if (list.length > 0) {
        // 随机一个房间进去打几下
        let idx = Util.getRandomInt(0, list.length);
        let room = list[idx];
        let flagJoin = room.join(this.userInfo);
        console.log(`机器人${this.userInfo.uid}进入房间${room.roomId}`)
        if (flagJoin) {
          let hitCount = Util.getRandomInt(confRoom.RCCB, confRoom.RCCB + confRoom.RCCUD + 1);
          await this.wait(1000);
          for (let i = 0; i < hitCount; i++) {
            let count = Math.random() < .5 ? 1 : 5
            for (let j = 0; j < count; j++) {
              let listHole = room.holeList.filter((hole: Hole) => hole.isOut);
              if (listHole.length > 0) {
                let holeIdx = Util.getRandomInt(0, listHole.length)
                let hole = listHole[holeIdx]
                let weaponIdx = Util.getRandomInt(0, socketManager.listWeapon.length)
                room.clickHole(this.userInfo.uid, hole.idx, socketManager.listWeapon[weaponIdx]);
                await this.wait(500);
              }
            }
            await this.wait(confRoom.RCHB + Math.random() * confRoom.RCHUD);
          }
          console.log(`机器人${this.userInfo.uid}退出房间${room.roomId}`)
          room.leave(this.userInfo.uid);
        }

      }
      await this.wait(confRoom.RCB + Math.random() * confRoom.RCUD)
      if (this.isAlive) {
        this.autoCheckRoom()
      }
    }
  }
  checkRoom() {

  }
}
