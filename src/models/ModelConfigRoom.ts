
import { Schema, model } from 'mongoose';
const ModelConfigRoom = new Schema({
  name: { type: String, default: '' },
  id: { type: Number, default: 0 },
  RP: { type: Number, default: 0 },
  AP: { type: String, default: "[]" },
  RB: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  // 武器消耗/成功获得
  diviseWeaponGainAndCost: { type: Number, default: 2},
})

export default model('configRoom', ModelConfigRoom);