const switchAspectFactor = 1.75;
const borderSize = 0.5;
const effectSpeed = 10;

let aspect;
let tileWidth;
let tileHeight;
let offsetX;
let offsetY;
let selectedGroup;
let previousGroup;
let frame;
let map;
let cols;
let mouseDown;
let lastMousePos;
let mouseMoved;
let redraw = true;

const images = await Promise.all([
  LoadImage('images/empty.png', 0),
  LoadImage('images/text_7.png', 1),
  LoadImage('images/text_3.png', 2),
  LoadImage('images/text_9.png', 3),
  LoadImage('images/text_5.png', 4),
  LoadImage('images/las.png', 5),
  LoadImage('images/text_6.png', 6),
  LoadImage('images/text_1.png', 7),
  LoadImage('images/branza_6a.png', 8),
  LoadImage('images/branza_2a.png', 9),
  LoadImage('images/empty_green.png',11),
  LoadImage('images/branza_3a.png', 12),
  LoadImage('images/text_4.png', 13),
  LoadImage('images/branza_2b_m.png', 14),
  LoadImage('images/pole.png', 15),
  LoadImage('images/branza_6c.png', 16),
  LoadImage('images/branza_2c_m.png', 17),
  LoadImage('images/branza_7.png', 18),
  LoadImage('images/branza_2a_m.png', 19),
  LoadImage('images/branza_10b.png', 20),
  LoadImage('images/woda.png', 21),
  LoadImage('images/branza_4.png', 22),
  LoadImage('images/branza_01a.png', 23),
  LoadImage('images/branza_9_m.png', 24),
  LoadImage('images/branza_8a_m.png', 25),
  LoadImage('images/branza_8c.png', 26),
  LoadImage('images/branza_8a.png', 27),
  LoadImage('images/branza_8c_m.png', 28),
  LoadImage('images/branza_5b.png', 29),
  LoadImage('images/branza_3c.png', 30),
  LoadImage('images/branza_3b.png', 31),
  LoadImage('images/branza_3b_m.png', 32),
  LoadImage('images/branza_5a.png', 33),
  LoadImage('images/branza_3d.png', 34),
  LoadImage('images/branza_8d.png', 35),
  LoadImage('images/text_10.png', 36),
  LoadImage('images/text_8.png', 37),
  LoadImage('images/text_2.png', 38),
  LoadImage('images/branza_8b_m.png', 39),
  LoadImage('images/branza_2b.png', 40),
  LoadImage('images/branza_5b_m.png', 41),
  LoadImage('images/branza_10a.png', 42),
  LoadImage('images/branza_8b.png', 43),
  LoadImage('images/branza_5a_m.png', 44),
  LoadImage('images/branza_3c_m.png', 45)
]);

for(let r = 0; r < vMap.length; r++){
  for(let c = 0; c < vMap[r].length; c++){
    vMap[r][c] = { id: vMap[r][c], blendFrame: 0, clickFrame: effectSpeed };
  }
}

for(let r = 0; r < hMap.length; r++){
  for(let c = 0; c < hMap[r].length; c++){
    hMap[r][c] = { id: hMap[r][c], blendFrame: 0, clickFrame: effectSpeed };
  }
}

switchAspect();
const canvas = document.getElementById('content');
canvas.style.backgroundColor = "white";

document.getElementById('loader').classList.add("fade-out");
setTimeout(function() {
  document.getElementById('loader').style.display = 'none';
  startBlendingIn();
  setInterval(() => {
    if(redraw) {
      draw();
      redraw = false;
    }}, 1000 / 60);
}, 500);

canvas.onmousedown = (event) => {
  mouseDown = true;
  mouseMoved = false;
  lastMousePos = { x: event.x, y: event.y };
}

canvas.onmouseup = (event) => {
  mouseDown = false;
  if(!mouseMoved){
    const tile = getObjectFromScreen(event.x, event.y);
    if(tile){
      startClick(tile);
      startColorize(tile);
      redraw = true;
    }
  }
}

canvas.onmousemove = (event) => {
  if(!mouseDown) return;
  if(lastMousePos.x == event.x && lastMousePos.y == event.y) return;

  if(Math.abs(lastMousePos.x - event.x) > 3 || Math.abs(lastMousePos.y - event.y) > 3){
    mouseMoved = true;
  }
  offsetY += event.y - lastMousePos.y;
  if(offsetY < -map.length * tileHeight / 2 + canvas.height) offsetY = -map.length * tileHeight / 2 + canvas.height;
  if(offsetY > -tileHeight / 2) offsetY = -tileHeight / 2;
  lastMousePos = { x: event.x, y: event.y };
  redraw = true;
}

function startClick(tile){
  tile.clickFrame = 0;
  continueClick(tile);
}

function continueClick(tile){
  tile.clickFrame++;
  redraw = true;

  if(tile.clickFrame < effectSpeed){
    setTimeout(() => { continueClick(tile); }, 1000 / 60);
  }
}

function startColorize(tile){
   const img = images.find((img) => { return img.id == "img" + tile.id });
  if(img.src.indexOf("text_") == -1 && img.src.indexOf("branza_") == -1) return;
  previousGroup = selectedGroup;
  if(img.src.indexOf("text_") != -1)
    selectedGroup = parseInt(img.src.substring(img.src.indexOf("text_") + 5, img.src.lastIndexOf(".")));
  else{
    selectedGroup = parseInt(img.src.substring(img.src.indexOf("branza_") + 7, img.src.lastIndexOf(".")));
  }
  frame = 0;
  continueColorize();
}

function continueColorize(){
  frame++;
  redraw = true;

  if(frame < effectSpeed - 1){
    setTimeout(() => { continueColorize(); }, 1000 / 60);
  }
}

function startBlendingIn(){
  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      map[r][c].blendFrame = -r;
    }
  }
  continueBlendingIn();
}

function continueBlendingIn(){
  let finish = true;

  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      if(map[r][c].blendFrame < effectSpeed - 1){
        map[r][c].blendFrame++;
        finish = false;
      }
    }
  }

  redraw = true;

  if(!finish){
    setTimeout(() => { continueBlendingIn(); }, 1000 / 60);
  }
}

function startBlendingOut(){
  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      map[r][c].blendFrame = effectSpeed + r;
    }
  }
  continueBlendingOut();
}

function continueBlendingOut(){
  let finish = true;

  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      if(map[r][c].blendFrame > 0){
        map[r][c].blendFrame--;
        finish = false;
      }
    }
  }

  redraw = true;

  if(!finish){
    setTimeout(() => { continueBlendingOut(); }, 1000 / 60);
  }else{
    switchAspect();
    if(selectedGroup) selectedGroup = undefined;
    if(previousGroup) previousGroup = undefined;
    startBlendingIn();
  }
}

function switchAspect() {
  const a = window.innerWidth / window.innerHeight;

  if(aspect !== undefined && ((aspect >= switchAspectFactor && a < switchAspectFactor) || (aspect < switchAspectFactor && a >= switchAspectFactor))){
    aspect = a;
    startBlendingOut();
    return;
  }

  if(a >= switchAspectFactor){
    map = hMap;
    cols = 6.5;
  }else{
    map = vMap;
    cols = 3.5;
  }

  aspect = a;

  const canvas = document.getElementById('content');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  tileWidth = (canvas.width - cols * borderSize * 2) / cols;
  tileHeight = 143 * tileWidth / 280;

  if(map === hMap){
    offsetX = -tileWidth;
    offsetY = -tileHeight / 2;
  }else{
    offsetX = -tileWidth * 3 / 4;
    offsetY = -tileHeight / 2;
  }
}

function onWindowResize() {
  switchAspect();
  redraw = true;
}

function draw(){
  const canvas = document.getElementById('content');
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      if(map[r][c].blendFrame < 1) continue;

      let img = images.find((img) => { return img.id == "img" + map[r][c].id });
      
      if(map[r][c].blendFrame < effectSpeed - 1) {
        img = img.blended[map[r][c].blendFrame - 1];
      }else
      if(selectedGroup && img.src.indexOf("_" + selectedGroup) != -1){
        img = img.colorized[frame - 1];
      }else if(previousGroup && img.src.indexOf("_" + previousGroup) != -1 && frame < effectSpeed - 1){
        img = img.colorized[effectSpeed - frame - 2];
      }
      
      let imgWidth = tileWidth;
      let imgHeight = img.height * imgWidth / img.width;
      let x = offsetX + borderSize + c * (tileWidth + borderSize * 2) + r % 2 * (tileWidth / 2 + borderSize);
      let y = offsetY + borderSize + tileHeight + r * (tileHeight / 2 + borderSize);

      if(map[r][c].clickFrame < effectSpeed){
        let downSize;
        if(map[r][c].clickFrame < effectSpeed / 2)
          downSize = 0.2 * map[r][c].clickFrame / (effectSpeed / 2 - 1);
        else
          downSize = 0.2 * (effectSpeed - map[r][c].clickFrame) / (effectSpeed / 2 - 1);
        x += tileWidth * downSize / 2;
        y -= tileHeight * downSize / 2;
        imgWidth -= imgWidth * downSize;
        imgHeight -= imgHeight * downSize;
      }

      ctx.drawImage(img, x, y - imgHeight, imgWidth, imgHeight);
    }
  }
}

function colorize(image, r, g, b, frames) {
  image.colorized = [];

  for(let f = 1; f < frames; f++){
    const offscreen = new OffscreenCanvas(image.width, image.height);
    const ctx = offscreen.getContext("2d");

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const a = f / (frames - 1);

    for (let i = 0; i < imageData.data.length; i += 4) {
      let lightness = parseInt((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
      let bup = (255 - lightness) * 0.3;
      lightness += bup;

      imageData.data[i + 0] = imageData.data[i] + (lightness * r - imageData.data[i]) * a;
      imageData.data[i + 1] = imageData.data[i + 1] + (lightness * g - imageData.data[i + 1]) * a;
      imageData.data[i + 2] = imageData.data[i + 2] + (lightness * b - imageData.data[i + 2]) * a;
    }

    ctx.putImageData(imageData, 0, 0);
    image.colorized.push(offscreen);
  }
}

function blend(image, frames) {
  image.blended = [];

  for(let f = 1; f < frames - 1; f++){
    const offscreen = new OffscreenCanvas(image.width, image.height);
    const ctx = offscreen.getContext("2d");

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const a = f / (frames - 1);

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 3] *= a;
    }

    ctx.putImageData(imageData, 0, 0);
    image.blended.push(offscreen);
  }
}

function checkLine(p1, p2){
  return (x) => { return (p2[1] - p1[1]) / (p2[0] - p1[0]) * x + (p2[1] * p1[0] - p1[1] * p2[0]) / (p1[0] - p2[0]) }
}

function getObjectFromScreen(x, y){
  let res;

  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      const tileX = offsetX + borderSize + c * (tileWidth + borderSize * 2) + r % 2 * (tileWidth / 2 + borderSize);
      const tileY = offsetY + borderSize + tileHeight + r * (tileHeight / 2 + borderSize);

      const p1 = [tileX + tileWidth / 2, tileY - tileHeight];
      const p2 = [tileX + tileWidth, tileY - tileHeight / 2];
      const p3 = [tileX + tileWidth / 2, tileY];
      const p4 = [tileX, tileY - tileHeight / 2];

      if(checkLine(p1, p2)(x) < y 
        && checkLine(p2, p3)(x) > y
        && checkLine(p3, p4)(x) > y
        && checkLine(p4, p1)(x) < y){
          res = map[r][c];
      }
    }
  }

  return res;
}

function LoadImage(src, id) {
  return new Promise(function (resolve) {
    const img = new Image();
    img.onload = () => {
      if(img.src.indexOf("branza_") != -1 || img.src.indexOf("text_") != -1){
        colorize(img, 0, 0.8, 1, effectSpeed);
      }
      blend(img, effectSpeed);
      if(img.src.indexOf("text_") == -1) document.getElementById("loaderImg").src = img.src;
      resolve(img);
    }
    img.src = src + '?v=20250725';
    img.draggable = "false";
    img.id = "img" + id;
  });
}

window.addEventListener('resize', onWindowResize, false );
