let aspect;
let switchAspect = 1.5;

const images = await Promise.all([
  LoadImage('images/budownictwo_budowa.png'),
  LoadImage('images/elektrownia.png'),
  LoadImage('images/handel.png'),
  LoadImage('images/jednorodzinne.png'),
  LoadImage('images/kolej.png'),
  LoadImage('images/las.png'),
  LoadImage('images/lotnisko.png'),
  LoadImage('images/magazyny.png'),
  LoadImage('images/miasto_1.png'),
  LoadImage('images/miasto_2.png'),
  LoadImage('images/miasto_3.png'),
  LoadImage('images/oczyszczalnia.png'),
  LoadImage('images/parking.png'),
  LoadImage('images/pole.png'),
  LoadImage('images/port.png'),
  LoadImage('images/stadion.png'),
  LoadImage('images/supermarket.png'),
  LoadImage('images/szpital.png'),
  LoadImage('images/wies.png')
]);  

document.getElementById('loader').classList.add("fade-out");
setTimeout(function() { document.getElementById('loader').style.display = 'none' }, 500);

function onWindowResize() {
  const canvas = document.getElementById('content');
  const ctx = canvas.getContext('2d')

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cols = 7;
  const borderSize = 4;
  const tileWidth = (canvas.width - (cols - 1) * borderSize) * window.devicePixelRatio / cols, tileHeight = 143 * tileWidth / 280;
  const offsetX = -tileWidth / 2, offsetY = tileHeight / 2;
  const rows = canvas.height * window.devicePixelRatio / (tileHeight + borderSize) * 2 + 1;

  for(let r = 0; r < rows; r++){
    for(let c = 0;  c < cols; c++){
      const img = images[Math.floor(Math.random() * images.length)];
      const imgHeight = img.height * tileWidth / 280;
      const x = offsetX + c * (tileWidth + borderSize) + r % 2 * tileWidth / 2;
      const y = offsetY + r * (tileHeight / 2 + borderSize) - imgHeight;
      ctx.drawImage(img, x, y, tileWidth, imgHeight);
    }
  }
}

function LoadImage(src) {
  return new Promise(function (resolve) {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src + '?v=20250725';
    img.draggable = "false";
  });
}

window.addEventListener('resize', onWindowResize, false );

window.onload = function() {
  onWindowResize();
}