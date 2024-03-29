import { Schema, model } from 'mongoose';

let ModelAnimaType = new Schema({
  // 动物名称
  name: { type: String, default: '' },
  // 倍率
  mult: { type: Number, default: 0 },
  // id
  id: { type: Number, default: 0 },
  // 出现的权重
  power: { type: Number, default: 1 },
  // 动物生命
  ZH: { type: Number, default: 0 },
  canInHole: { type: Array, default: [] },
})
export default model('animalType', ModelAnimaType);