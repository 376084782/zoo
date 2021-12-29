import RoomManager from "./controller/RoomManager";
import PROTOCLE from "./config/PROTOCLE";
import UserManager from "./controller/UserManager";
import { PEOPLE_EACH_GAME_MAX } from "./config";
import Util from "./Util";
import RobotManager from "./controller/RobotManager";


export default class socketManager {
  static io;
  static userSockets = {};
  static userMap: UserManager[] = [];
  static aliveRoomList: RoomManager[] = [];
  static getRoomCanJoin({ level }): RoomManager {
    // 检查当前已存在的房间中 公开的，人未满的,未开始游戏的
    let list = this.aliveRoomList.filter((roomCtr: RoomManager) => {
      return (
        roomCtr.level == level &&
        roomCtr.uidList.length < PEOPLE_EACH_GAME_MAX
      );
    });
    if (list.length == 0) {
      let roomNew = new RoomManager({ level });
      this.aliveRoomList.push(roomNew);
      return roomNew;
    } else {
      return list[0];
    }
  }
  static removeRoom(room: RoomManager) {
    this.aliveRoomList = this.aliveRoomList.filter((ctr: RoomManager) => ctr != room);
  }
  // 公共错误广播
  static sendErrByUidList(uidList: number[], protocle: string, data) {
    this.sendMsgByUidList(uidList, PROTOCLE.SERVER.ERROR, {
      protocle,
      data
    });
  }
  static sendMsgByUidList(userList: number[], type: string, data = {}) {
    userList.forEach(uid => {
      let socket = this.userSockets[uid];
      if (socket) {
        socket.emit("message", {
          type,
          data
        });
      }
    });
  }
  static initRobot() {
    this.userMap = [];
    RobotManager.listName.forEach((name, i) => {
      let uid = 10000000000000 + i
      this.userMap[uid] = new UserManager({
        avatar: `https://oss.yipeng.online/avatar/图片${i + 1}.jpg`,
        nickname: name,
        uid,
        sex: 1,
        score: Util.getRandomInt(1000, 4000),
        isRobot: true
      })
    })
  }
  static init(io) {
    // console.log('======初始化io======')
    this.io = io;
    this.initRobot()
    this.listen();

  }
  static getUserCtrById(uid) {
    if (!this.userMap[uid]) {
      this.userMap[uid] = new UserManager({
        avatar:
          "https://shebz.oss-cn-qingdao.aliyuncs.com/shebz/cb6c5c121bea4ef591660087f48f9f53494030.png",
        nickname: "机器人" + uid,
        uid,
        sex: 1,
        score: Util.getRandomInt(1000, 4000),
        isRobot: true
      });
    }
    let ctrUser = this.userMap[uid];
    return ctrUser;
  }
  static getUserInfoById(uid) {
    let ctr = this.getUserCtrById(uid);
    return ctr.getInfo();
  }
  static listen() {
    this.io.on("connect", this.onConnect);
  }
  static getRoomCtrByRoomId(roomId): RoomManager {
    if (!!roomId) {
      return this.aliveRoomList.find(roomCtr => roomCtr.roomId == roomId);
    }
  }
  static onMessage(res, socket) {
    console.log("收到消息", res);
    // 公共头
    let uid = res.uid;
    if (!uid) {
      return;
    }
    if (!this.userMap[uid]) {
      this.userMap[uid] = new UserManager(res.userInfo);
    }
    let data = res.data;
    let type = res.type;
    if (this.userSockets[uid] && this.userSockets[uid] != socket) {
      // 已存在正在连接中的，提示被顶
      socketManager.sendErrByUidList([uid], "connect", {
        msg: "账号已被登录，请刷新或退出游戏"
      });
    }
    this.userSockets[uid] = socket;

    let userCtr = this.getUserCtrById(uid);
    let roomId = userCtr.inRoomId;
    let roomCtr = this.getRoomCtrByRoomId(roomId);
    if (roomCtr) {
      console.log(roomCtr.roomId, "roomId");
    }

    switch (type) {
      case PROTOCLE.CLIENT.EXIT: {
        if (roomCtr) {
          roomCtr.leave(uid);
        }
        break;
      }
      case PROTOCLE.CLIENT.RECONNECT: {
        // 检测重连数据
        let dataGame: any = {
          isMatch: data.isMatch
        };
        let userInfo = userCtr.getInfo();

        if (userCtr.inRoomId && roomCtr) {
          // 获取游戏数据并返回
          dataGame = roomCtr.getRoomInfo(uid);
        }
        this.sendMsgByUidList([userCtr.uid], PROTOCLE.SERVER.RECONNECT, {
          userInfo: userInfo,
          dataGame
        });
        break;
      }
      case PROTOCLE.CLIENT.MATCH: {
        // 参与或者取消匹配
        let { level, flag } = data;
        if (flag) {
          if (roomCtr && roomCtr.roomId != 0) {
            this.sendErrByUidList([userCtr.uid], PROTOCLE.CLIENT.MATCH, {
              msg: "已经处于游戏中，无法匹配"
            });
            return;
          }

          let targetRoom: RoomManager;
          targetRoom = this.getRoomCanJoin({ level });

          targetRoom.join(uid);
        } else {
          if (!roomCtr) {
            return;
          }
          roomCtr.leave(uid);
        }
        break;
      }
      case PROTOCLE.CLIENT.PING: {
        // 发回接收到的时间戳，计算ping
        this.sendMsgByUidList([uid], PROTOCLE.SERVER.PING, {
          timestamp: data.timestamp
        });
        break;
      }
    }
  }
  static onDisconnect(socket) {
    // 通过socket反查用户，将用户数据标记为断线
    for (let uid in this.userSockets) {
      if (this.userSockets[uid] == socket) {
        console.log('用户uid掉线,取消匹配')
        // 踢出用户
        let userCtr = this.getUserCtrById(uid);
        let roomId = userCtr.inRoomId;
        let roomCtr = this.getRoomCtrByRoomId(roomId);
        if (roomCtr) {
          roomCtr.leave(uid);
          userCtr.inRoomId = 0;
        }
      }
    }
  }
  static onConnect(socket) {
    socket.on('disconnect', () => {
      socketManager.onDisconnect(socket)
    });
    socket.on("message", res => {
      console.log(this.onMessage);
      socketManager.onMessage(res, socket);
    });
  }
}
