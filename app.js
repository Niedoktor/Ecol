const switchAspectFactor = 1.75;
const borderSize = 0.5;
const effectSpeed = 10;
const offScreenCanvas = new OffscreenCanvas(0, 0);
const knowMoreSpeed = 3000;
const fps = 60;

let aspect;
let tileWidth;
let tileHeight;
let offsetX;
let offsetY;
let selectedGroup;
let previousGroup;
let hoverTile;
let previousTile;
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
let train = {
  initSpeed: 0.003
}
let cars = [];
let plane = {};
let images = [];
let knowMoreTimeoutId;
let knowMoreShow;
let simRunning = true;

await LoadImage('images/empty.png', 0);
await LoadImage('images/knowMore.png', 100);

await Promise.all(
  imageFiles.map((file) => LoadImage(file.file, file.id))
);

document.getElementById('loader').classList.add("fade-out");
setTimeout(function() { document.getElementById('loader').style.display = 'none'; continueBlendingIn(); }, 500);

for(let r = 0; r < vMap.length; r++){
  for(let c = 0; c < vMap[r].length; c++){
    vMap[r][c] = {
      id: vMap[r][c],
      blendFrame: parseInt(-Math.random() * 60),
      clickFrame: effectSpeed,
      colorFrame: 0
    };
  }
}

for(let r = 0; r < hMap.length; r++){
  for(let c = 0; c < hMap[r].length; c++){
    hMap[r][c] = {
      id: hMap[r][c],
      blendFrame: parseInt(-Math.random() * 60),
      clickFrame: effectSpeed,
      colorFrame: 0
    };
  }
}

switchAspect();
const canvas = document.getElementById('content');
canvas.style.backgroundColor = "white";

setInterval(() => {
  draw();
}, 1000 / fps);

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
      if(!img.isText && !img.isSector) {
        selectedGroup = undefined;
      }
      startClick(tile);
      redraw = true;
    }
  }
}

canvas.onmousemove = (event) => {
  const tile = getObjectFromScreen(event.x, event.y);
  if(tile){
    const img = images.find((img) => { return img.id == "img" + tile.id });
    if(img && (img.isText || img.isSector))
      canvas.style.cursor = "pointer";
    else
      canvas.style.cursor = "default";
  }else canvas.style.cursor = "default";

  hover(tile);

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

  const img = images.find((img) => { return img.id == "img" + tile.id });
  if(!img) return;

  if(!img.isText && !img.isSector) return;
  previousGroup = selectedGroup;
  selectedGroup = img.group;

  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      let img = images.find((img) => { return img.id == "img" + map[r][c].id });
      if(img && img.group && (img.group == selectedGroup || img.group == previousGroup)){
        startColorize(map[r][c]);
      }
    }
  }

  continueClick(tile);
}

function continueClick(tile){
  tile.clickFrame++;
  redraw = true;

  if(tile.clickFrame < effectSpeed){
    setTimeout(() => { continueClick(tile); }, 1000 / fps);
  }else{
    if(selectedGroup && previousGroup === selectedGroup){
      window.open(links[selectedGroup], "blank");
    }else{
      knowMoreShow = false;
      knowMoreTimeoutId = setTimeout(() => { startMoreFrame(tile); }, knowMoreSpeed / 4);
    }
  }
}

function hover(tile){
  if(tile == hoverTile) return;

  if(hoverTile){
    previousTile = hoverTile;
    startColorize(hoverTile);
    hoverTile = undefined;
  }

  if(tile){
    const img = images.find((img) => { return img.id == "img" + tile.id });
    if(img && img.group && (img.group == selectedGroup || img.group == previousGroup)) return;

    hoverTile = tile;
    startColorize(tile);
  }
}

function startColorize(tile){
  tile.colorFrame = 0;
  continueColorize(tile);
}

function continueColorize(tile){
  tile.colorFrame++;
  redraw = true;

  if(tile.colorFrame < effectSpeed - 1){
    setTimeout(() => { continueColorize(tile); }, 1000 / fps);
  }
}

function startMoreFrame(tile){
  moreFrame = 0;
  moreFrameDir = 1;
  continueMoreFrame(tile);
}

function stopMoreFrame(){
  moreFrame = 0;
  knowMoreShow = false;
  if(knowMoreTimeoutId) clearTimeout(knowMoreTimeoutId);
  knowMoreTimeoutId = undefined;
}

function continueMoreFrame(tile){
  moreFrame += moreFrameDir;
  redraw = true;

  if(moreFrame == effectSpeed - 1){
    moreFrameDir = -1;
    knowMoreShow = !knowMoreShow;
    knowMoreTimeoutId = setTimeout(() => { continueMoreFrame(tile); }, 1000 / fps * 2);
  }else if(moreFrame != 0){
    knowMoreTimeoutId = setTimeout(() => { continueMoreFrame(tile); }, 1000 / fps * 2);
  }else{
    knowMoreTimeoutId = setTimeout(() => { startMoreFrame(tile); }, knowMoreSpeed);
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
    setTimeout(() => { continueBlendingIn(); }, 1000 / fps);
  }else{
    undefined;
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
    setTimeout(() => { continueBlendingOut(); }, 1000 / fps);
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
  delete train.pos;
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

    const img0 = images.find((img) => { return img.id == "img0" });
    const knowMoreImg = images.find((img) => { return img.id == "img100" });

    for(let r = 0; r < map.length; r++){
      for(let c = 0; c < map[r].length; c++){
        let img = images.find((img) => { return img.id == "img" + map[r][c].id });
        const isSelectedGroup = img.group && selectedGroup && selectedGroup == img.group;
        const isHovered = hoverTile && hoverTile == map[r][c];
        const isPreviousGroup = previousGroup && img.group && previousGroup == img.group;
        const wasHovered = previousTile && previousTile == map[r][c];
        let clickFrame = isSelectedGroup && knowMoreTimeoutId ? moreFrame : map[r][c].clickFrame;
        let colorizeFrame = effectSpeed;
        let blendFrame = map[r][c].blendFrame;
        let colorFrame = map[r][c].colorFrame;

        if(isSelectedGroup || isHovered){
          colorizeFrame = colorFrame - 1;
        }else if((isPreviousGroup || wasHovered) && colorFrame < effectSpeed - 1){
          colorizeFrame = effectSpeed - colorFrame - 2;
        }

        if(!img) {
          drawTile(ctx, r, c, img0, effectSpeed);
          if(!img) continue;
        }

        if(img.isText){
          drawTile(ctx, r, c, img0, clickFrame, colorizeFrame);
          colorizeFrame = effectSpeed;
          if(isSelectedGroup){
            if(knowMoreShow) img = knowMoreImg;
            if(knowMoreTimeoutId && moreFrame > 0) blendFrame = effectSpeed - moreFrame - 1;
          }
        }

        drawTile(ctx, r, c, img, clickFrame, colorizeFrame, blendFrame);
      }
    }
    redraw = false;
  }

  const mainCtx = canvas.getContext('2d');
  mainCtx.drawImage(offScreenCanvas, 0, 0);

  drawShip(mainCtx);
  drawCars(mainCtx);
  drawTrain(mainCtx);
  drawPlane(mainCtx);  
}

function drawTile(ctx, r, c, img, clickFrame, colorizeFrame, blendFrame){
  if(map[r][c].blendFrame < 1) return;

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

  if(blendFrame < effectSpeed - 1) {
    img = img.blended[blendFrame - 1];
  }else
  if(selectedGroup || hoverTile){
    if(colorizeFrame < effectSpeed - 1){
      img = img.colorized[colorizeFrame];
    }else
      if(selectedGroup && map[r][c].id != 0) img = img.blended[5];
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
    car.pos = map == vMap ? getScreenPositionFromGrid(0.58, 4.1) : getScreenPositionFromGrid(0.6, 2.1);
  }else{
    car.img = images.find((img) => { return img.id == "img" + (50 + r) });
    car.pos = map == vMap ? getScreenPositionFromGrid(3.75, 10.8) : getScreenPositionFromGrid(2.75, 7.2);
  }

  if(car.img && simRunning){
    cars.push(car);
  }

  setTimeout(addCar, 500 + Math.random() * 2000);
}

function drawTrain(ctx){
  let img57 = images.find((img) => { return img.id == "img57" });
  let img58 = images.find((img) => { return img.id == "img58" });
  if(!img57 || !img58) return;

  if(!train.pos){
    if(map == vMap){
      train.pos = getScreenPositionFromGrid(-0.15, 12.8);
      train.breakPoint = 0.35;
      train.dir = { x: 1, y: 1},
      train.img = img57;
    }else{
      train.pos = getScreenPositionFromGrid(7.3, 2.42);
      train.breakPoint = 0.79;
      train.dir = { x: -1, y: 1},
      train.img = img58;
    }

    train.speed = train.initSpeed;
    train.loaded = false;
  }

  train.pos.x += tileWidth * train.speed * train.dir.x;
  train.pos.y += tileHeight * train.speed * train.dir.y;

  let x = offsetX + train.pos.x;
  let y = offsetY + train.pos.y;
  let w = train.img.width * tileWidth / 280;
  let h = train.img.height * w / train.img.width;

  ctx.drawImage(train.img, x, y - h, w, h);

  if((train.dir.x > 0 && x > canvas.width) || y - h > canvas.height){
     delete train.pos;
     return;
  }

  if(!train.loaded){
    if(train.speed > 0) {
      if((train.dir.x > 0 && x > canvas.width * train.breakPoint)
        || (train.dir.x < 0 && x < canvas.width * train.breakPoint)){
        train.speed -= train.initSpeed * 0.0035;
        if(train.speed <= 0){
          setTimeout(() => {
            train.loaded = true;
            if(map == hMap){
              train.dir = { x: 1, y: -1};
            }
          }, 5000);
        }
      }
    }
  }else{
    if(train.speed < train.initSpeed){
      train.speed += train.initSpeed * 0.0035;
    }
  }
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

  const oc = new OffscreenCanvas(image.width, image.height);
  const srcImageCtx = oc.getContext("2d");  
  srcImageCtx.drawImage(image, 0, 0);
  const srcImageData = srcImageCtx.getImageData(0, 0, image.width, image.height);
  const dstImageData = new ImageData(image.width, image.height);
  const lightMap = new Uint8Array(srcImageData.data.length);

  for (let i = 0, l = 0; i < srcImageData.data.length; i += 4, l++) {
    lightMap[l] = parseInt((srcImageData.data[i] + srcImageData.data[i + 1] + srcImageData.data[i + 2]) / 3);
  }

  for(let f = 1; f < frames; f++){
    const offscreen = new OffscreenCanvas(image.width, image.height);
    const ctx = offscreen.getContext("2d");

    const a = f / (frames - 1);

    for (let i = 0, l = 0; i < srcImageData.data.length; i += 4, l++) {
      let lightness = lightMap[l];
      let w = (255 - lightness) / 255;
      if(image.isText) w = 1 - w;
      const aw = a * w;

      dstImageData.data[i + 0] = srcImageData.data[i] + (lightness * r - srcImageData.data[i]) * aw;
      dstImageData.data[i + 1] = srcImageData.data[i + 1] + (lightness * g - srcImageData.data[i + 1]) * aw;
      dstImageData.data[i + 2] = srcImageData.data[i + 2] + (lightness * b - srcImageData.data[i + 2]) * aw;
      dstImageData.data[i + 3] = srcImageData.data[i + 3];
    }

    ctx.putImageData(dstImageData, 0, 0);
    image.colorized.push(offscreen);
  }
}

function blend(image, frames) {
  image.blended = [];

  const oc = new OffscreenCanvas(image.width, image.height);
  const srcImageCtx = oc.getContext("2d");  
  srcImageCtx.drawImage(image, 0, 0);

  for(let f = 1; f < frames - 1; f++){
    const offscreen = new OffscreenCanvas(image.width, image.height);
    const ctx = offscreen.getContext("2d");

    const dstImageData = srcImageCtx.getImageData(0, 0, image.width, image.height);

    const a = f / (frames - 1);

    for (let i = 0; i < dstImageData.data.length; i += 4) {
      dstImageData.data[i + 3] *= a;
    }

    ctx.putImageData(dstImageData, 0, 0);
    image.blended.push(offscreen);
  }
}

// function knowMore(image, frames) {
//   image.more = [];
//   const knowMoreImg = images.find((img) => { return img.id == "img100" });

//   for(let f = 1; f < frames * 2 - 1; f++){
//     const offscreen = new OffscreenCanvas(image.width, image.height);
//     const ctx = offscreen.getContext("2d");

//     ctx.drawImage(f < frames ? image.colorized[f - 1] : knowMoreImg.colorized[f - frames], 0, 0, image.width, image.height);

//     image.more.push(offscreen);
//   }
// }

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
      img.isText = img.src.indexOf("text_") != -1 || img.src.indexOf("knowMore") != -1;
      img.isSector = img.src.indexOf("branza_") != -1;
      if(img.src.indexOf("text_") != -1) img.group = parseInt(img.src.substring(img.src.indexOf("text_") + 5, img.src.lastIndexOf(".")));
      if(img.isSector) img.group = parseInt(img.src.substring(img.src.indexOf("branza_") + 7, img.src.lastIndexOf(".")));
      if(!img.isText) colorize(img, 0, 0.8, 1, effectSpeed);
      blend(img, effectSpeed);
      images.push(img);
      document.getElementById("loader").innerText = `${images.length} / ${imageFiles.length + 2}`;
      resolve(img);
    }
    img.draggable = "false";
    img.id = "img" + id;
    img.src = src + '?v=20250807.1';
  });
}

window.addEventListener('resize', onWindowResize, false );

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    simRunning = false;
  } else {
    simRunning = true;
  }
});