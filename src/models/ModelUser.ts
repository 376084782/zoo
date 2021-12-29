import { Schema, model } from 'mongoose';

const ModelUser = new Schema({
  // 累计收益
  gainTotal: { type: Number, default: 0 },
  // 是否加入小黑屋
  isInBlackRoom: { type: Boolean, default: false },
  // id
  id: { type: Number, default: 0 },
  // 玩家名称
  name: { type: String, default: '' },
  // 玩家头像
  avatar: { type: String, default: '' },
})

export default model('user', ModelUser);