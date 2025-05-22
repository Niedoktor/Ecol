let aspect;

function onWindowResize() {
  const a = window.innerWidth / window.innerHeight;

  if(aspect === undefined || (aspect >= 1.777 && a < 1.777) || (aspect < 1.777 && a >= 1.777)){
    if(a >= 1.777 ){
      document.getElementById("contentHorizontal").className = "fade-in";
      document.getElementById("contentHorizontal").style.display = "inline";
      document.getElementById("contentVertical").className = "fade-out";
    }else{
      document.getElementById("contentVertical").className = "fade-in";
      document.getElementById("contentVertical").style.display = "inline";
      document.getElementById("contentHorizontal").className = "fade-out";
    }
    aspect = a;
  }
}

window.addEventListener('resize', onWindowResize, false );

window.onload = function() {
  onWindowResize();
}