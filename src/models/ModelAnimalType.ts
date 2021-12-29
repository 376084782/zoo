import { Schema, model } from 'mongoose';

let ModelAnimaType = new Schema({
  // 动物名称
  name: { type: String, default: '' },
  // 倍率
  mult: { type: Number, default: 0 },
  // id
  id: { type: Number, default: 0 }
})
export default model('animalType', ModelAnimaType);