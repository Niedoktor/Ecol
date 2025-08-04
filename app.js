const switchAspectFactor = 1.75;
const borderSize = 0.5;
const effectSpeed = 10;
const offScreenCanvas = new OffscreenCanvas(0, 0);
const knowMoreSpeed = 3000;

let aspect;
let tileWidth;
let tileHeight;
let offsetX;
let offsetY;
let selectedGroup;
let previousGroup;
let frame;
let moreFrame;
let moreFrameDir;
let map;
let cols;
let mouseDown;
let lastMousePos;
let mouseMoved;
let redraw = true;
let ship = {
  initSpeed: 0.001
}
let cars = [];
let plane = {};
let images = [];
let knowMoreTimeoutId;

for(let r = 0; r < vMap.length; r++){
  for(let c = 0; c < vMap[r].length; c++){
    vMap[r][c] = { id: vMap[r][c], blendFrame: parseInt(-Math.random() * 60), clickFrame: effectSpeed };
  }
}

for(let r = 0; r < hMap.length; r++){
  for(let c = 0; c < hMap[r].length; c++){
    hMap[r][c] = { id: hMap[r][c], blendFrame: parseInt(-Math.random() * 60), clickFrame: effectSpeed };
  }
}

switchAspect();
const canvas = document.getElementById('content');
canvas.style.backgroundColor = "white";

await LoadImage('images/empty.png', 0);
await LoadImage('images/knowMore.png', 100);

await Promise.all(
  imageFiles.map((file) => LoadImage(file.file, file.id))
);

document.getElementById('loader').classList.add("fade-out");
setTimeout(function() { document.getElementById('loader').style.display = 'none'; continueBlendingIn(); }, 500);

setInterval(() => {
  draw();
}, 1000 / 60);

addCar();

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
      const img = images.find((img) => { return img.id == "img" + tile.id });
       if(img.src.indexOf("text_") == -1 && img.src.indexOf("branza_") == -1) return;
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
  stopMoreFrame();
  continueClick(tile);
}

function continueClick(tile){
  tile.clickFrame++;
  redraw = true;

  if(tile.clickFrame < effectSpeed){
    setTimeout(() => { continueClick(tile); }, 1000 / 60);
  }else{
    if(previousGroup === selectedGroup){
      window.open(links[selectedGroup], "blank");
    }
  }
}

function startColorize(tile){
  const img = images.find((img) => { return img.id == "img" + tile.id });
  if(!img) return;

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
  }else{
    startMoreFrame();
  }
}

function startMoreFrame(){
  moreFrame = 0;
  moreFrameDir = 1;
  knowMoreTimeoutId = setTimeout(() => { continueMoreFrame(); }, knowMoreSpeed);
}

function stopMoreFrame(){
  moreFrame = 0;
  if(knowMoreTimeoutId) clearTimeout(knowMoreTimeoutId);
  knowMoreTimeoutId = undefined;
}

function continueMoreFrame(){
  moreFrame += moreFrameDir;
  redraw = true;

  if(moreFrame == effectSpeed * 2 - 1){
    moreFrameDir = -1;
    knowMoreTimeoutId = setTimeout(() => { continueMoreFrame(); }, knowMoreSpeed);
  }else if(moreFrame != 0){
    knowMoreTimeoutId = setTimeout(() => { continueMoreFrame(); }, 1000 / 60);
  }else{
    startMoreFrame();
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
      let img = images.find((img) => { return img.id == "img" + map[r][c].id });
      if(img && map[r][c].blendFrame < effectSpeed - 1){
        map[r][c].blendFrame++;
        finish = false;
      }
    }
  }

  if(!finish){
    redraw = true;
    timeOutId = setTimeout(() => { continueBlendingIn(); }, 1000 / 60);
  }else{
    timeOutId = undefined;
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

  delete ship.pos;
  cars = [];
  delete plane.pos;
  stopMoreFrame();
}

function onWindowResize() {
  switchAspect();
  redraw = true;
}

function draw(){
  const ctx = offScreenCanvas.getContext('2d');
  const canvas = document.getElementById('content');

  if(redraw){
    offScreenCanvas.width = canvas.width;
    offScreenCanvas.height = canvas.height;
    
    ctx.fillStyle = canvas.style.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let r = 0; r < map.length; r++){
      for(let c = 0; c < map[r].length; c++){
        let img = images.find((img) => { return img.id == "img" + map[r][c].id });

        if(!img || map[r][c].blendFrame < effectSpeed - 1){
          let img0 = images.find((img) => { return img.id == "img0" });
          drawTile(ctx, r, c, img0, 10);
          if(!img) continue;
        }
        
        if(map[r][c].blendFrame < 1) continue;
        if(map[r][c].blendFrame < effectSpeed - 1) {
          img = img.blended[map[r][c].blendFrame - 1];
        }else
          if(selectedGroup){
            if(img.src.indexOf("_" + selectedGroup) != -1){
              if(img.src.indexOf("text_") != -1 && moreFrame > 0){
                img = img.more[moreFrame - 1];
              }else img = img.colorized[frame - 1];
            }else if(previousGroup && img.src.indexOf("_" + previousGroup) != -1 && frame < effectSpeed - 1){
              img = img.colorized[effectSpeed - frame - 2];
            }else img = img.blended[5];
          }

        drawTile(ctx, r, c, img, map[r][c].clickFrame);
      }
    }
    redraw = false;
  }

  const mainCtx = canvas.getContext('2d');
  mainCtx.drawImage(offScreenCanvas, 0, 0);

  drawShip(mainCtx);
  drawCars(mainCtx);
  drawPlane(mainCtx);
}

function drawTile(ctx, r, c, img, clickFrame){
  let imgWidth = tileWidth;
  let imgHeight = img.height * imgWidth / img.width;
  let x = offsetX + borderSize + c * (tileWidth + borderSize * 2) + r % 2 * (tileWidth / 2 + borderSize);
  let y = offsetY + borderSize + tileHeight + r * (tileHeight / 2 + borderSize);

  if(clickFrame < effectSpeed){
    let downSize;
    if(clickFrame < effectSpeed / 2)
      downSize = 0.2 * clickFrame / (effectSpeed / 2 - 1);
    else
      downSize = 0.2 * (effectSpeed - clickFrame) / (effectSpeed / 2 - 1);
    x += tileWidth * downSize / 2;
    y -= tileHeight * downSize / 2;
    imgWidth -= imgWidth * downSize;
    imgHeight -= imgHeight * downSize;
  }

  ctx.drawImage(img, x, y - imgHeight, imgWidth, imgHeight);
}

function drawCars(ctx){
  let c = 0;
  while(c < cars.length){
    const car = cars[c];

    car.pos.x += tileWidth * car.speed;
    car.pos.y += tileHeight * car.speed;

    let x = offsetX + car.pos.x;
    let y = offsetY + car.pos.y;
    let w = car.img.width * tileWidth / 280;
    let h = car.img.height * w / car.img.width;

    ctx.drawImage(car.img, x, y - h, w, h);

    if((car.speed > 0 && (x > canvas.width || y - h > canvas.height))
      || (car.speed < 0 && (x + w < 0 || y < 0))
      || (map === hMap && car.speed > 0 && x > canvas.width * 0.35)){
      cars.splice(c, 1);
    }else c++;
  }
}

function addCar(){
  const car = {
    speed: 0.005 * (1 - 2 * Math.round(Math.random()))
  };

  const r = Math.floor(Math.random() * 3);

  if(car.speed > 0){
    car.img = images.find((img) => { return img.id == "img" + (47 + r) });
    car.pos = map == vMap ? getScreenPositionFromGrid(0.58, 4.1) : getScreenPositionFromGrid(0.58, 3.1);
  }else{
    car.img = images.find((img) => { return img.id == "img" + (50 + r) });
    car.pos = map == vMap ? getScreenPositionFromGrid(3.75, 10.8) : getScreenPositionFromGrid(2.75, 7.2);
  }

  if(car.img) cars.push(car);

  setTimeout(addCar, 500 + Math.random() * 2000);
}

function drawShip(ctx){
  let img = images.find((img) => { return img.id == "img46" });
  if(!img) return;

  if(!ship.pos){
    if(map == vMap){
      ship.pos = getScreenPositionFromGrid(-0.12, 6.8);
      ship.breakPoint = 0.35;
    }else{
      ship.pos = getScreenPositionFromGrid(-0.12, 5.36);
      ship.breakPoint = 0.07;
    }
    ship.speed = ship.initSpeed;
    ship.loaded = false;
  }

  ship.pos.x += tileWidth * ship.speed;
  ship.pos.y += tileHeight * ship.speed;

  let x = offsetX + ship.pos.x;
  let y = offsetY + ship.pos.y;
  let w = img.width * tileWidth / 280;
  let h = img.height * w / img.width;

  ctx.drawImage(img, x, y - h, w, h);

  if(x > canvas.width || y - h > canvas.height){
     delete ship.pos;
     return;
  }
  if(x > canvas.width * ship.breakPoint && ship.speed > 0 && !ship.loaded){
    ship.speed -= ship.initSpeed * 0.001;
    if(ship.speed <= 0){
      setTimeout(() => {
        ship.loaded = true;
      }, 5000);
    }
  }
  if(ship.speed < ship.initSpeed && ship.loaded){
    ship.speed += ship.initSpeed * 0.001;
  }
}

function drawPlane(ctx){
  if(!plane.pos && Math.random() > 0.01) return;

  if(!plane.pos){
    plane.speed = {
      x: 0.01 * (1 - 2 * Math.round(Math.random())),
      y: 0.01 * (1 - 2 * Math.round(Math.random())),      
    }
    let id;
    if(plane.speed.x > 0 && plane.speed.y < 0) id = "img53";
    if(plane.speed.x > 0 && plane.speed.y > 0) id = "img54";
    if(plane.speed.x < 0 && plane.speed.y > 0) id = "img55";
    if(plane.speed.x < 0 && plane.speed.y < 0) id = "img56";
    plane.img = images.find((img) => { return img.id == id });
    if(!plane.img) return;
    plane.w = plane.img.width * tileWidth / 280;
    plane.h = plane.img.height * plane.w / plane.img.width;
    plane.pos = {
      x: -offsetX + (plane.speed.x > 0 ? -plane.w : canvas.width),
      y: -offsetY + (plane.speed.y < 0 ? canvas.height / 2 + Math.random() * canvas.height / 2 : Math.random() * canvas.height / 2)
    }
  }

  plane.pos.x += tileWidth * plane.speed.x;
  plane.pos.y += tileHeight * plane.speed.y;

  let x = offsetX + plane.pos.x;
  let y = offsetY + plane.pos.y;

  ctx.drawImage(plane.img, x, y - plane.h, plane.w, plane.h);

  if(x > canvas.width || y < 0 || x + plane.w < 0 || y - plane.h > canvas.height){
     delete plane.pos;
     return;
  }
}

function getScreenPositionFromGrid(x, y){
  let screenX = borderSize + x * (tileWidth + borderSize * 2) + y % 2 * (tileWidth / 2 + borderSize);
  let screenY = borderSize + tileHeight + y * (tileHeight / 2 + borderSize);
  return { x: screenX, y: screenY };
}

function colorize(image, r, g, b, frames) {
  image.colorized = [];

  for(let f = 1; f < frames; f++){
    const offscreen = new OffscreenCanvas(image.width, image.height);
    const ctx = offscreen.getContext("2d");

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const a = f / (frames - 1);
    const inverse = image.src.indexOf("text_") != -1 || image.src.indexOf("knowMore") != -1;

    for (let i = 0; i < imageData.data.length; i += 4) {
      let lightness = parseInt((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
      let w = (255 - lightness) / 255;
      if(inverse){
        if(lightness < 200) w = 0; else w = 1 - w;
      }
      const aw = a * w;

      imageData.data[i + 0] = imageData.data[i] + (lightness * r - imageData.data[i]) * aw;
      imageData.data[i + 1] = imageData.data[i + 1] + (lightness * g - imageData.data[i + 1]) * aw;
      imageData.data[i + 2] = imageData.data[i + 2] + (lightness * b - imageData.data[i + 2]) * aw;
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

function knowMore(image, frames) {
  image.more = [];
  const knowMoreImg = images.find((img) => { return img.id == "img100" });

  for(let f = 1; f < frames * 2; f++){
    const offscreen = new OffscreenCanvas(image.width, image.height);
    const ctx = offscreen.getContext("2d");

    let w = image.width * (frames - f - 1) / frames;

    let x = image.width / 2 - w / 2;
    
    ctx.drawImage(w > 0 ? image.colorized[8] : knowMoreImg.colorized[8], x, 0, w, image.height);

    image.more.push(offscreen);
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
      if(img.src.indexOf("branza_") != -1 || img.src.indexOf("text_") != -1 || img.src.indexOf("knowMore") != -1){
        if(img.src.indexOf("branza_") != -1)
          colorize(img, 0, 0.8, 1, effectSpeed);
        else
          colorize(img, 0, 0.5, 1, effectSpeed);
        if(img.src.indexOf("text_") != -1) knowMore(img, effectSpeed);
      }
      blend(img, effectSpeed);
      images.push(img);
      document.getElementById("loader").innerText = `${images.length} / ${imageFiles.length + 2}`;
      // redraw = true;
      // draw();
      resolve(img);
    }
    img.draggable = "false";
    img.id = "img" + id;
    img.src = src;// + '?v=' + parseInt(Math.random() * 1000000);
  });
}

window.addEventListener('resize', onWindowResize, false );
