const switchAspectFactor = 1.5;
const borderSize = 0.5;
const effectSpeed = 10;

let aspect;
let tileWidth;
let tileHeight;
let offsetX;
let offsetY;
let selectedTile;
let previousTile;
let frame;
let map;
let cols;
let mouseDown;
let lastMousePos;
let mouseMoved;

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
    vMap[r][c] = { id: vMap[r][c], frame: 0 };
  }
}

for(let r = 0; r < hMap.length; r++){
  for(let c = 0; c < hMap[r].length; c++){
    hMap[r][c] = { id: hMap[r][c], frame: 0 };
  }
}

document.getElementById('loader').classList.add("fade-out");
setTimeout(function() { document.getElementById('loader').style.display = 'none'; startBlendingIn(); }, 500);

const canvas = document.getElementById('content');
canvas.onclick = (event) => {
}

canvas.onmousedown = (event) => {
  mouseDown = true;
  mouseMoved = false;
  lastMousePos = { x: event.x, y: event.y };
}

canvas.onmouseup = (event) => {
  mouseDown = false;
  if(!mouseMoved){
    const pos = getObjectFromScreen(event.x, event.y);
    if(pos && (!selectedTile || pos.x != selectedTile.x || pos.y != selectedTile.y)){
      const img = images.find((img) => { return img.id == "img" + map[pos.y][pos.x].id });
      if(img.src.indexOf("text_") == -1) return;
      previousTile = selectedTile;
      selectedTile = pos;
      selectedTile.n = img.src.substring(img.src.indexOf("text_") + 5, img.src.lastIndexOf("."));
      frame = 0;
      continueColorize();
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
  if(offsetY > -tileHeight / 2) offsetY = -tileHeight / 2;
  if(offsetY < -map.length * tileHeight / 2 + canvas.height) offsetY = -map.length * tileHeight / 2 + canvas.height;
  draw();
  lastMousePos = { x: event.x, y: event.y };
}

function continueColorize(){
  frame++;
  draw();
  
  if(frame < effectSpeed - 1){
    setTimeout(() => { continueColorize(); }, 1000 / 60);
  }
}

function startBlendingIn(){
  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      map[r][c].frame = -r;
    }
  }
  continueBlendingIn();
}

function continueBlendingIn(){
  let finish = true;

  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      if(map[r][c].frame < effectSpeed - 1){
        map[r][c].frame++;
        finish = false;
      }
    }
  }
  draw();

  if(!finish){
    setTimeout(() => { continueBlendingIn(); }, 1000 / 60);
  }
}

function startBlendingOut(){
  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      map[r][c].frame = effectSpeed + r;
    }
  }
  continueBlendingOut();
}

function continueBlendingOut(){
  let finish = true;

  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      if(map[r][c].frame > 0){
        map[r][c].frame--;
        finish = false;
      }
    }
  }
  draw();

  if(!finish){
    setTimeout(() => { continueBlendingOut(); }, 1000 / 60);
  }else{
    if(aspect >= switchAspect){
      map = hMap;
      cols = 6.5;
    }else{
      map = vMap;
      cols = 3.5;
    }
    if(selectedTile) selectedTile = undefined;
    if(previousTile) previousTile = undefined;
    startBlendingIn();
  }
}

function switchAspect(a) {
  if(a >= switchAspect){
    map = hMap;
    cols = 6.5;
  }else{
    map = vMap;
    cols = 3.5;
  }

  aspect = a;

  const canvas = document.getElementById('content');

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
  draw();
}

function draw(){
  const canvas = document.getElementById('content');
  const ctx = canvas.getContext('2d')

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const a = window.innerWidth / window.innerHeight;

  if(aspect === undefined || (aspect >= switchAspect && a < switchAspect) || (aspect < switchAspect && a >= switchAspect)){
    if(aspect !== undefined){
      aspect = a;
      startBlendingOut();
      return;
    }else{
      switchAspect(a);
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      if(map[r][c].frame < 1) continue;

      let img = images.find((img) => { return img.id == "img" + map[r][c].id });
      
      if(map[r][c].frame < effectSpeed - 1) {
        img = img.blended[map[r][c].frame - 1];
      }else
      if(selectedTile && ((selectedTile.x == c && selectedTile.y == r) || img.src.indexOf("branza_" + selectedTile.n) != -1)){
        img = img.colorized[frame - 1];
      }else if(previousTile && ((previousTile.x == c && previousTile.y == r) || img.src.indexOf("branza_" + previousTile.n) != -1) && frame < effectSpeed - 1){
        img = img.colorized[effectSpeed - frame - 2];
      }
      
      const imgHeight = img.height * tileWidth / img.width;
      const x = offsetX + borderSize + c * (tileWidth + borderSize * 2) + r % 2 * (tileWidth / 2 + borderSize);
      const y = offsetY + borderSize + tileHeight + r * (tileHeight / 2 + borderSize);
      ctx.drawImage(img, x, y - imgHeight, tileWidth, imgHeight);
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
      const lightness = parseInt((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
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
          res = { x: c, y: r };
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

window.onload = function() {
  onWindowResize();
}