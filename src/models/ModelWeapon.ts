import { Schema, model } from 'mongoose';

let ModelWeapon = new Schema({
  // 武器名称
  name: { type: String, default: '' },
  // 倍率
  mult: { type: Number, default: 0 },
  // 所属房间id
  roomId: { type: Number, default: 0 },
  type: { type: Number, default: 0 },
})
export default model('weapon', ModelWeapon);