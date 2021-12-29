import ModelAnimalType from "../models/ModelAnimalType";
import ModelConfig from "../models/ModelConfig";
import ModelConfigRoom from "../models/ModelConfigRoom"

async function initRoomConfig() {
  const configRoom = [
    {
      id: 1,
      name: '初级房',
      RP: 10,
      PG: 100,
      ZG: 400,
      AP: JSON.stringify([
        { max: 0, min: NaN, AP: 10 },
        { max: 1000, min: 0, AP: 0 },
        { max: NaN, min: 1000, AP: -10 },
      ])
    },
    {
      id: 2,
      name: '中级房',
      RP: 0,
      PG: 200,
      ZG: 1000,
      AP: JSON.stringify([
        { max: 0, min: NaN, AP: 10 },
        { max: 1000, min: 0, AP: 0 },
        { max: NaN, min: 1000, AP: -10 },
      ])
    },
    {
      id: 3,
      name: '高级房',
      RP: -8,
      PG: 300,
      ZG: 2000,
      AP: JSON.stringify([
        { max: 0, min: NaN, AP: 10 },
        { max: 1000, min: 0, AP: 0 },
        { max: NaN, min: 1000, AP: -10 },
      ])
    }
  ];
  await ModelConfigRoom.deleteMany();
  ModelConfigRoom.create(configRoom)
}


async function initAnimal() {
  const configAnimal = [
    { id: 1, name: '鸟1', mult: 2.3 },
    { id: 2, name: '鸟2', mult: 3.3 },
    { id: 3, name: '鸟3', mult: 4.5 },
    { id: 3, name: '鸟4', mult: 8.4 },
  ];
  await ModelAnimalType.deleteMany();
  ModelAnimalType.create(configAnimal)
}


async function initConfigBasic() {
  const configBasic = [
    { ZH: 4, PA: 1, TP: 3, BP: -20 },
  ];
  await ModelConfig.deleteMany();
  ModelConfig.create(configBasic)
}

const createData = async () => {
  await initRoomConfig();
  await initAnimal();
  await initConfigBasic();
}
export { createData }