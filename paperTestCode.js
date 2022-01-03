const gpio = require('node-wiring-pi');
const fs = require('fs');
const Shock_level = require(__dirname + '/Shock_level.js');

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

let delay = 10;
let size = 100;
let stop = 3;
let addCnt = 1;

fs.writeFileSync(__dirname + '/files/log.log', '', 'utf8');

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
    flag = stop;
  }

  console.log(returnLevel);
  console.log(`Weak: ${weak}, Strong: ${strong}`);
  console.log(`cnt ${cnt} addCnt ${addCnt}, size ${size}`);
  console.log();
};

const main = () => {
  let tempArr = new Object();
  let temp = datas[parseInt(cnt)].split(',');
  cnt += addCnt;

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

  if (inputBuffer.length >= size * 2) {
    if (flag == 0) {
      ShockLevel();
    }

    let temp = inputBuffer;
    inputBuffer = new Array();

    for (let i = 0; i < size; i++) {
      inputBuffer.push(temp[size + i]);
    }

    flag = flag > 0 ? flag - 1 : 0;
  }

  if (parseInt(cnt) < datas.length) {
    setTimeout(main, delay);
    // setTimeout(main, 1);
  } else {
    console.log('Exit...');

    fs.appendFileSync(__dirname + '/files/log.log', `${weak},${strong},${weak + strong}\n`, 'utf8');

    gpio.digitalWrite(Blue, 0);
    gpio.digitalWrite(Red, 0);
    gpio.digitalWrite(Green, 0);
    gpio.digitalWrite(Buzzer, 0);

    controller();
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

let cntArr = [0.5, 1, 2, 4, 5, 10, 20, 50, 100];
let cntArrFlag = 0;
let sizeArr = [0.01, 0.02, 0.04, 0.05, 0.1, 0.2, 0.4, 0.5, 1, 2, 3];
let sizeArrFlag = 0;

const controller = () => {
  weak = 0;
  strong = 0;
  cnt = 0;
  flag = 0;
  inputBuffer = new Array();

  if (sizeArr.length != sizeArrFlag) {
    if (cntArr.length != cntArrFlag) {
      addCnt = cntArr[cntArrFlag];
      size = parseInt(parseInt(100 / cntArr[cntArrFlag]) * sizeArr[sizeArrFlag]);

      console.log(`cntArrFlag ${parseInt(cntArr[cntArrFlag] * 10)}, sizeArrFlag ${parseInt(sizeArr[sizeArrFlag] * 1000)}`);
      fs.appendFileSync(__dirname + '/files/log.log', `${parseInt(cntArr[cntArrFlag] * 10)},${parseInt(sizeArr[sizeArrFlag] * 1000)},`, 'utf8');

      cntArrFlag++;
      main();
    } else if (sizeArr.length - 1 == sizeArrFlag) {
      console.log('Exit......');
    } else {
      cntArrFlag = 0;
      sizeArrFlag++;

      addCnt = cntArr[cntArrFlag];
      size = parseInt(parseInt(100 / cntArr[cntArrFlag]) * sizeArr[sizeArrFlag]);

      console.log(`cntArrFlag ${parseInt(cntArr[cntArrFlag] * 10)}, sizeArrFlag ${parseInt(sizeArr[sizeArrFlag] * 1000)}`);
      fs.appendFileSync(__dirname + '/files/log.log', `${parseInt(cntArr[cntArrFlag] * 10)},${parseInt(sizeArr[sizeArrFlag] * 1000)},`, 'utf8');

      cntArrFlag++;
      main();
    }
  } else {
    console.log('Exit...');
  }
};

controller();
