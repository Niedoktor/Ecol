let aspect;
let switchAspect = 1.5;

function onWindowResize() {
  const a = window.innerWidth / window.innerHeight;

  if(aspect === undefined || (aspect >= switchAspect && a < switchAspect) || (aspect < switchAspect && a >= switchAspect)){
    if(a >= switchAspect){
      // document.getElementById("contentHorizontal").className = "fade-in";
      // document.getElementById("contentHorizontal").style.display = "inline";
      // document.getElementById("contentVertical").className = "fade-out";
      document.getElementById("innerContent").className = "contentHorizontal";
      document.getElementById("innerContent").style.height = "100%";
    }else{
      // document.getElementById("contentVertical").className = "fade-in";
      // document.getElementById("contentVertical").style.display = "inline";
      // document.getElementById("contentHorizontal").className = "fade-out";
      document.getElementById("innerContent").className = "contentVertical";
      document.getElementById("innerContent").style.width = "100%";
    }
    aspect = a;
  }

  if(aspect >= switchAspect){
    let w = 2.44 * window.innerHeight;
    document.getElementById("innerContent").style.width = w + "px";
  }else{
    let h = 1.72 * window.innerWidth;
    document.getElementById("innerContent").style.height = h + "px";
  }
}

window.addEventListener('resize', onWindowResize, false );

window.onload = function() {
  onWindowResize();
}