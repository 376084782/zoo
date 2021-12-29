import Util from "../Util";
import socketManager from "..";
import _ from "lodash";
import PROTOCLE from "../config/PROTOCLE";
// 游戏内玩家全部离线的房间，自动清除
export default class RoomManager {
  // 房间等级
  level = 1;
  roomId = 0;
  isPublic = true;
  // 存当前在游戏中的uid列表
  uidList = [];
  constructor({ level }) {
    this.roomId = Util.getUniqId();
    this.level = level;
  }

  // 玩家离开
  leave(uid) {
    let userCtr = socketManager.getUserCtrById(uid);
    this.uidList = this.uidList.filter(uid1 => uid1 != uid);
    socketManager.sendMsgByUidList(this.uidList, PROTOCLE.SERVER.ROOM_USER_UPDATE, {
      userList: this.getUserDataList()
    });

    userCtr.inRoomId = 0;
    userCtr.updateToClient();
  }
  // 玩家加入
  join(uid) {
    if (this.uidList.indexOf(uid) > -1) {
      socketManager.sendErrByUidList([uid], "match", {
        msg: "玩家已经在房间内"
      });
      return
    }
    let userCtr = socketManager.getUserCtrById(uid);

    this.uidList.push(uid);
    socketManager.sendMsgByUidList(this.uidList, PROTOCLE.SERVER.ROOM_USER_UPDATE, {
      userList: this.getUserDataList()
    });

    userCtr.inRoomId = this.roomId;
    userCtr.updateToClient();
  }
  getUserDataList() {
    let userDataList = [];
    this.uidList.forEach(uid => {
      userDataList.push(socketManager.getUserInfoById(uid));
    });
    return userDataList;
  }


  // 获取全服房间内游戏数据
  getRoomInfo(uid) {
    let info: any = {
      isInRoom: true,
      gameInfo: {},
      userList: this.getUserDataList(),
    };
    return info;
  }
}
