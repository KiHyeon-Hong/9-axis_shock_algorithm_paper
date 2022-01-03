const gpio = require('node-wiring-pi');
const fs = require('fs');
const Shock_level = require(__dirname + '/Shock_level.js');

let config = fs.readFileSync(__dirname + '/files/config.json', 'utf8');
config = JSON.parse(config);

let datas = fs.readFileSync(__dirname + '/files/data.txt', 'utf8').split('\n');

const Blue = 29;
const Red = 28;
const Green = 27;
const Buzzer = 26;

gpio.setup('wpi');
gpio.pinMode(Blue, gpio.OUTPUT);
gpio.pinMode(Red, gpio.OUTPUT);
gpio.pinMode(Green, gpio.OUTPUT);
gpio.pinMode(Buzzer, gpio.OUTPUT);

let cnt = 0;
let flag = 0;
var inputBuffer = new Array();

let weak = 0;
let strong = 0;

const ShockLevel = () => {
  let returnLevel = Shock_level.getShockLevel(0, inputBuffer);

  if (returnLevel.shocklevel == 2) {
    gpio.digitalWrite(Blue, 0);
    gpio.digitalWrite(Green, 0);
    gpio.digitalWrite(Red, 1);
    gpio.digitalWrite(Buzzer, 1);

    strong++;
  } else if (returnLevel.shocklevel == 1) {
    gpio.digitalWrite(Blue, 0);
    gpio.digitalWrite(Green, 1);
    gpio.digitalWrite(Red, 0);
    gpio.digitalWrite(Buzzer, 1);

    weak++;
  } else {
    gpio.digitalWrite(Blue, 1);
    gpio.digitalWrite(Green, 0);
    gpio.digitalWrite(Red, 0);
    gpio.digitalWrite(Buzzer, 0);
  }

  if (returnLevel.shocklevel != 0) {
    flag = config.stop;
  }

  console.log(returnLevel);
  console.log(`Weak: ${weak}, Strong: ${strong}`);
  console.log();
};

const main = () => {
  let tempArr = new Object();
  let temp = datas[cnt].split(',');
  cnt++;

  tempArr.acc_x = parseFloat(temp[0]);
  tempArr.acc_y = parseFloat(temp[1]);
  tempArr.acc_z = parseFloat(temp[2]);
  tempArr.vel_x = parseFloat(temp[3]);
  tempArr.vel_y = parseFloat(temp[4]);
  tempArr.vel_z = parseFloat(temp[5]);
  tempArr.mag_x = parseFloat(temp[6]);
  tempArr.mag_y = parseFloat(temp[7]);
  tempArr.mag_z = parseFloat(temp[8]);

  inputBuffer.push(tempArr);

  if (inputBuffer.length >= config.size * 2) {
    if (flag == 0) {
      ShockLevel();
    }

    let temp = inputBuffer;
    inputBuffer = new Array();

    for (let i = 0; i < config.size; i++) {
      inputBuffer.push(temp[config.size + i]);
    }

    flag = flag > 0 ? flag - 1 : 0;
  }

  if (cnt < datas.length) {
    setTimeout(main, config.delay);
    // setTimeout(main, 1);
  } else {
    console.log('Exit...');

    gpio.digitalWrite(Blue, 0);
    gpio.digitalWrite(Red, 0);
    gpio.digitalWrite(Green, 0);
    gpio.digitalWrite(Buzzer, 0);
  }
};

process.on('SIGINT', function () {
  console.log('Exit...');

  gpio.digitalWrite(Blue, 0);
  gpio.digitalWrite(Red, 0);
  gpio.digitalWrite(Green, 0);
  gpio.digitalWrite(Buzzer, 0);

  process.exit();
});

main();
