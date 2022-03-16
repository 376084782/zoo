import { Schema, model } from 'mongoose';

const ModelConfig = new Schema({
  // 子弹攻击
  PA: { type: Number, default: 0 },
  // 抽放水参数
  TP: { type: Number, default: 0 },
  // 小黑屋参数
  BP: { type: Number, default: 0 },
  // 频率
  PL: { type: Number, default: 0 },
  // 自动消失的时间
  TO: { type: Number, default: 0 },
})

export default model('config', ModelConfig);