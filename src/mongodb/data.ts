import ModelAnimalType from "../models/ModelAnimalType";
import ModelConfig from "../models/ModelConfig";
import ModelConfigRoom from "../models/ModelConfigRoom"
import ModelUser from "../models/ModelUser";
import ModelWeapon from "../models/ModelWeapon";

async function initRoomConfig() {
  const configRoom = [
    {
      id: 1,
      name: '初级房',
      RP: 10,
      RB: 400,
      AP: JSON.stringify([
        { max: 0, min: null, AP: 10 },
        { max: 1000, min: 0, AP: 0 },
        { max: null, min: 1000, AP: -10 },
      ]),
      min: 1000,
      max: 10000000
    },
    {
      id: 2,
      name: '中级房',
      RP: 0,
      RB: 1000,
      AP: JSON.stringify([
        { max: 0, min: null, AP: 10 },
        { max: 1000, min: 0, AP: 0 },
        { max: null, min: 1000, AP: -10 },
      ]),
      min: 1000,
      max: 10000000
    },
    {
      id: 3,
      name: '高级房',
      RP: -8,
      RB: 2000,
      AP: JSON.stringify([
        { max: 0, min: null, AP: 10 },
        { max: 1000, min: 0, AP: 0 },
        { max: null, min: 1000, AP: -10 },
      ]),
      min: 1000,
      max: 10000000
    }
  ];
  await ModelConfigRoom.deleteMany();
  ModelConfigRoom.create(configRoom)
  await ModelWeapon.deleteMany();
  let nameMap = {
    0: '树枝',
    1: '骨头',
    2: '锤子',
    3: '刷子',
    4: '拖鞋',
    5: '棒球',
  }
  configRoom.forEach(async room => {
    let configWeapon = []
    for (let i = 0; i < 6; i++) {
      configWeapon.push({
        type: i + 1,
        mult: 2 * (i + 1),
        name: nameMap[i],
        roomId: room.id
      })
    }
    ModelWeapon.create(configWeapon)
  })
}


async function initAnimal() {
  const configAnimal = [
    { id: 1, name: '兔子', mult: 2.3, power: 1, ZH: 4 },
    { id: 2, name: '刺猬', mult: 3.3, power: 1, ZH: 4 },
    { id: 3, name: '熊猫', mult: 4.5, power: 1, ZH: 4 },
    { id: 4, name: '狗', mult: 8.4, power: 1, ZH: 4 },
    { id: 5, name: '狮子', mult: 8.4, power: 1, ZH: 4 },
    { id: 6, name: '猩猩', mult: 8.4, power: 1, ZH: 4 },
    { id: 7, name: '猫头鹰', mult: 8.4, power: 1, ZH: 4 },
    { id: 8, name: '老鼠', mult: 8.4, power: 1, ZH: 4 },
  ];
  await ModelAnimalType.deleteMany();
  ModelAnimalType.create(configAnimal)
}


async function initConfigBasic() {
  const configBasic = [
    { ZH: 4, PA: 1, TP: 3, BP: -20, PL: 2000, TO: 2000 },
  ];
  await ModelConfig.deleteMany();
  ModelConfig.create(configBasic)
}


async function initUser() {
  const listUser = [
    { coin: 100000, gainTotal: 100000, uid: 111, nickname: '钱最多', avatar: '' },
    { coin: 100000, gainTotal: 5000, uid: 112, nickname: '钱很少', avatar: '' },
    { coin: 100000, gainTotal: 50000, uid: 113, nickname: '钱很多', avatar: '' },
    { coin: 100000, gainTotal: -1000, uid: 114, nickname: '输一点', avatar: '' },
    { coin: 100000, gainTotal: -50000, uid: 115, nickname: '输很多', avatar: '' },
    { coin: 100000, gainTotal: -100000, uid: 116, nickname: '输狂多', avatar: '' },

    {
      uid: 10001,
      nickname: 'robot1',
      avatar: '',
      coin: 10000000
    }, {
      uid: 10002,
      nickname: 'robot2',
      avatar: '',
      coin: 10000000
    }, {
      uid: 10003,
      nickname: 'robot3',
      avatar: '',
      coin: 10000000
    }, {
      uid: 10004,
      nickname: 'robot4',
      avatar: '',
      coin: 10000000
    }, {
      uid: 10005,
      nickname: 'robot5',
      avatar: '',
      coin: 10000000
    }
  ];
  await ModelUser.deleteMany();
  ModelUser.create(listUser)
}

const createData = async () => {
  // await initRoomConfig();
  // await initAnimal();
  // await initConfigBasic();
  await initUser()
}
export { createData }