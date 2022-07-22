
import { Schema, model } from 'mongoose';
const ModelConfigRoom = new Schema({
  name: { type: String, default: '' },
  id: { type: Number, default: 0 },
  crazy_delay: { type: Number, default: 10000 },
  crazy_duration: { type: Number, default: 3000 },
  RP: { type: Number, default: 0 },
  AP: { type: String, default: "[]" },
  RB: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  // 武器消耗/成功获得
  diviseWeaponGainAndCost: { type: Number, default: 1 },
  // 开启几个机器人
  RCC: { type: Number, default: 1000 },
  // 机器人检查时间基数
  RCB: { type: Number, default: 3000 },
  // 机器人检查时间浮动
  RCUD: { type: Number, default: 2000 },
  // 机器人击打时间基数
  RCHB: { type: Number, default: 3000 },
  // 机器人击打时间浮动
  RCHUD: { type: Number, default: 2000 },
  // 机器人在每个房间打几次的基数
  RCCB: { type: Number, default: 3 },
  // 机器人在每个房间打几次的次数浮动
  RCCUD: { type: Number, default: 2 },

})

export default model('configRoom', ModelConfigRoom);