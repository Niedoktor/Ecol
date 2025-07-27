let aspect;
const switchAspect = 1.5;
const cols = 3.5;
const borderSize = 0.5;
let tileWidth;
let tileHeight;
let offsetX;
let offsetY;
let selectedTile;
let previousTile;
let alpha;

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
]);

document.getElementById('loader').classList.add("fade-out");
setTimeout(function() { document.getElementById('loader').style.display = 'none' }, 500);

const canvas = document.getElementById('content');
canvas.onclick = (event) => {
  const pos = getObjectFromScreen(event.x, event.y);
  if(pos){
    const img = images.find((img) => { return img.id == "img" + map[pos.y][pos.x] });
    if(img.src.indexOf("text_") == -1) return;
    previousTile = selectedTile;
    selectedTile = pos;
    selectedTile.n = img.src.substring(img.src.indexOf("text_") + 5, img.src.lastIndexOf("."));
    alpha = 0;
    startBlending();
  }
}

function startBlending(){
  setTimeout(() => {
    alpha += 1.0 / 10;
    if(alpha < 1){
      startBlending();
    }else alpha = 1;
    draw();
  }, 1000 / 60)
}

function onWindowResize() {
  draw();
}

function draw(){
  const canvas = document.getElementById('content');
  const ctx = canvas.getContext('2d')

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  tileWidth = (canvas.width - cols * borderSize * 2) / cols;
  tileHeight = 143 * tileWidth / 280;
  offsetX = -tileWidth * 3 / 4;
  offsetY = -tileHeight / 2;

  for(let r = 0; r < map.length; r++){
    for(let c = 0; c < map[r].length; c++){
      let img = images.find((img) => { return img.id == "img" + map[r][c] });
      if(selectedTile && ((selectedTile.x == c && selectedTile.y == r) || img.src.indexOf("branza_" + selectedTile.n) != -1)){
        img = colorize(img, 0, 0.8, 1, alpha);
      }else if(previousTile && ((previousTile.x == c && previousTile.y == r) || img.src.indexOf("branza_" + previousTile.n) != -1)){
        img = colorize(img, 0, 0.8, 1, 1 - alpha);
      }
      const imgHeight = img.height * tileWidth / img.width;
      const x = offsetX + borderSize + c * (tileWidth + borderSize * 2) + r % 2 * (tileWidth / 2 + borderSize);
      const y = offsetY + borderSize + tileHeight + r * (tileHeight / 2 + borderSize);
      ctx.drawImage(img, x, y - imgHeight, tileWidth, imgHeight);
    }
  }
}

function colorize(image, r, g, b, a) {
  const offscreen = new OffscreenCanvas(image.width, image.height);
  const ctx = offscreen.getContext("2d");

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, image.width, image.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    let lightness = parseInt((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);

    imageData.data[i + 0] = imageData.data[i] + (lightness * r - imageData.data[i]) * a;
    imageData.data[i + 1] = imageData.data[i + 1] + (lightness * g - imageData.data[i + 1]) * a;
    imageData.data[i + 2] = imageData.data[i + 2] + (lightness * b - imageData.data[i + 2]) * a;
  }

  ctx.putImageData(imageData, 0, 0);

  return offscreen;
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
    img.onload = () => resolve(img);
    img.src = src + '?v=20250725';
    img.draggable = "false";
    img.id = "img" + id;
  });
}

window.addEventListener('resize', onWindowResize, false );

window.onload = function() {
  onWindowResize();
}