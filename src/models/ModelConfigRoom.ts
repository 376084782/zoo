
import { Schema, model } from 'mongoose';
const ModelConfigRoom = new Schema({
  name: { type: String, default: '' },
  id: { type: Number, default: 0 },
  RP: { type: Number, default: 0 },
  AP: { type: String, default: "[]" },
  PG: { type: Number, default: 0 },
  ZG: { type: Number, default: 0 },
})

export default model('configRoom', ModelConfigRoom);