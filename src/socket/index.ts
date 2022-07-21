import RoomManager from "./controller/RoomManager";
import PROTOCLE from "./config/PROTOCLE";
import { PEOPLE_EACH_GAME_MAX } from "./config";
import Util from "./Util";
import RobotManager from "./controller/RobotManager";
import ModelUser from "../models/ModelUser";
import ModelConfigRoom from "../models/ModelConfigRoom";
import ModelWeapon from "../models/ModelWeapon";


export default class socketManager {
  static listWeapon: any[] = []
  static listRoomConfig: any[] = []
  static isTest = true;
  static io;
  static userSockets = {};
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

  static listRobot: RobotManager[] = [];
  static async initRobots() {
    this.listRoomConfig = await ModelConfigRoom.find();
    this.listWeapon = await ModelWeapon.find()
    let listRoom = this.listRoomConfig
    listRoom.forEach(async (conf, m) => {
      for (let i = 0; i < conf.RCC; i++) {
        let userInfo = RobotManager.getRobotUser()
        if (userInfo) {
          let ctr = new RobotManager(conf.id, userInfo)
          this.listRobot.push(ctr);
        }
      }
    })
  }
  static async updateRoomConfig() {
    this.listRoomConfig = await ModelConfigRoom.find();
    this.listRoomConfig.forEach((room: any) => {
      let listRobot = this.listRobot.filter((robot: RobotManager) => robot.lev == room.id)
      let max = Math.max(room.RCC, listRobot.length);
      for (let i = 0; i < max; i++) {
        let r = listRobot[i];
        if (i <= room.RCC) {
          if (!r) {
            // 加个机器人
            let dataRobot = RobotManager.getRobotUser()
            if (dataRobot) {
              r = new RobotManager(room.id, dataRobot)
              this.listRobot.push(r);
            }
          } else {
            if (!r.isAlive) {
              r.isAlive = true
              r.autoCheckRoom()
            }
          }
        } else {
          if (r) {
            r.isAlive = false
          }
        }
      }
    })
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
  static init(io) {
    // console.log('======初始化io======')
    this.io = io;
    this.listen();
    this.initRobots()
  }
  static getInRoomByUid(uid) {
    let ctrRoom = this.aliveRoomList.find(ctr => ctr.uidList.indexOf(uid) > -1)
    return ctrRoom && ctrRoom.roomId;
  }
  static listen() {
    this.io.on("connect", this.onConnect);
  }
  static getRoomCtrByRoomId(roomId): RoomManager {
    if (!!roomId) {
      return this.aliveRoomList.find(roomCtr => roomCtr.roomId == roomId);
    }
  }
  static async onMessage(res, socket) {
    // console.log("收到消息", res);
    // 公共头
    let uid = res.uid;
    if (!uid) {
      return;
    }
    let modelUser = await ModelUser.findOne({ uid: uid })
    let userInfo = {
      uid: uid,
      nickname: '测试玩家' + uid,
      avatar: '',
      coin: 0
    }
    if (modelUser) {
      userInfo = {
        nickname: modelUser.nickname,
        uid: modelUser.uid,
        avatar: modelUser.avatar,
        coin: modelUser.coin
      }
    } else {
      await ModelUser.create(userInfo);
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

    let roomId = this.getInRoomByUid(uid);
    let roomCtr = this.getRoomCtrByRoomId(roomId);

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

        if (roomCtr) {
          // 获取游戏数据并返回
          dataGame = roomCtr.getRoomInfo(uid);
        }
        this.sendMsgByUidList([uid], PROTOCLE.SERVER.RECONNECT, {
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
            this.sendErrByUidList([uid], PROTOCLE.CLIENT.MATCH, {
              msg: "已经处于游戏中，无法匹配"
            });
            return;
          }

          let targetRoom: RoomManager;
          targetRoom = this.getRoomCanJoin({ level });

          targetRoom.join(userInfo);
        } else {
          if (!roomCtr) {
            return;
          }
          roomCtr.leave(uid);
        }
        break;
      }
      case 'CHAT': {
        if (!roomCtr) {
          return;
        }
        roomCtr.showChat(uid, data.conf)
        break
      }
      case PROTOCLE.CLIENT.PING: {
        // 发回接收到的时间戳，计算ping
        this.sendMsgByUidList([uid], PROTOCLE.SERVER.PING, {
          timestamp: data.timestamp
        });
        break;
      }
      case PROTOCLE.CLIENT.HIT: {
        if (roomCtr) {
          roomCtr.clickHole(uid, data.idx, data.conf);
        }
        break
      }
    }
  }
  static onDisconnect(socket) {
    // 通过socket反查用户，将用户数据标记为断线
    for (let uid in this.userSockets) {
      if (this.userSockets[uid] == socket) {
        console.log('用户uid掉线,取消匹配')
        // 踢出用户
        let roomId = this.getInRoomByUid(uid);
        let roomCtr = this.getRoomCtrByRoomId(roomId);
        if (roomCtr) {
          roomCtr.leave(uid);
        }
      }
    }
  }
  static onConnect(socket) {
    socket.on('disconnect', () => {
      socketManager.onDisconnect(socket)
    });
    socket.on("message", res => {
      socketManager.onMessage(res, socket);
    });
  }
}
