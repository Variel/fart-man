function logBase(base, value) {
  return Math.log(value) / Math.log(base);
}

var canvas = document.getElementById('game-view');
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var fooDensity = Math.round(window.innerWidth * window.innerHeight / 75000);
var fooFullTime = 20;

var potatoDensity = Math.round(Math.logBase(4, window.innerWidth * window.innerHeight / 100));
var potatoFullTime = 7;

window.addEventListener('resize',
  function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    fooDensity = Math.round(window.innerWidth * window.innerHeight / 75000);
    var potatoDensity = Math.round(Math.logBase(4, window.innerWidth * window.innerHeight / 100));
  });

var power = 70;

window.addEventListener('keydown',
  function (e) {
    if (e.keyCode === 32) {
      clickButton();
    }
  });

window.addEventListener('touchstart',
  function() {
    clickButton();
  });


function clickButton() {
  switch(gameState) {
    case 'start':
      gameStart();
      break;
    case 'play':
      if (fartCount > 0) {
        fartCount --;

        player.velocity.y = Math.sin(player.rotation - Math.PI / 2) * power;
        player.velocity.x = Math.cos(player.rotation - Math.PI / 2) * power;

        if (player.rotation <= 0) {
          player.velocity.rotation = -0.55;
        } else {
          player.velocity.rotation = 0.55;
        }
      }
      break;
    case 'over':
      gameStart();
      break;
  } 
}



/********************************/
/** Viewport / GameObject Type **/
/********************************/

var camera = {
  x: 0,
  y: 0
};

function Viewport() {
  this.activeCamera = camera;
  this.width = window.innerWidth;
  this.height = window.innerHeight;
}

Viewport.prototype.draw = function (obj) {

  var posX = obj.position.x - this.activeCamera.x;
  var posY = obj.position.y - this.activeCamera.y;

  ctx.translate(posX, posY);
  ctx.rotate(obj.rotation);
  ctx.drawImage(obj.image, -obj.image.width / 2, -obj.image.height / 2, obj.image.width, obj.image.height);
  ctx.rotate(-obj.rotation);
  ctx.translate(-posX, -posY);
};

function GameObject() {
  this.position = {
    x: 0,
    y: 0
  };
  this.rotation = 0;
  this.velocity = {
    x: 0,
    y: 0,
    rotation: 0
  };
  this.gravity = 1;
  this.image = null;
};

GameObject.prototype.clone = function() {
  var child = new GameObject();
  child.position = {
    x: this.position.x,
    y: this.position.y
  };
  child.rotation = this.rotation;
  child.velocity = {
    x: this.velocity.x,
    y: this.velocity.y,
    rotation: this.velocity.rotation
  };
  child.gravity = this.gravity;
  child.image = this.image;

  return child;
};

GameObject.prototype.update = function(sec) {
  this.velocity.y += 9.8 * this.gravity * sec;
  this.rotation += this.velocity.rotation * sec;
  this.position.y += this.velocity.y * sec;
  this.position.x += this.velocity.x * sec;

  if (this.rotation > Math.PI)
    this.rotation -= Math.PI * 2;
  if (this.rotation < -Math.PI)
    this.rotation += Math.PI * 2;
};

/********************************/
/**         E   N   D          **/
/********************************/




var player = new GameObject();

var fooParent = new GameObject();
fooParent.gravity = 0;
var fooList = [];

var potatoParent = new GameObject();
potatoParent.gravity = 0;
var potatoList = [];

var fart = new GameObject();

function initialize() {
  loadItem('./img/player.png', player, 'image');
  loadItem('./img/foo.png', fooParent, 'image');
  loadItem('./img/potato.png', potatoParent, 'image');
  loadItem('./img/fart.png', fart, 'image');
}



/********************************/
/**       L O A D I N G        **/
/********************************/

var loadCount = 0;
var loadedCount = 0;

function loadItem(src, obj, prop) {
  loadCount ++;

  var img = new Image();
  img.onload = function() {
    obj[prop] = img;

    loadFinished();
  };
  img.src = src;
}

function loadFinished() {
  loadedCount ++;
  setTimeout(function() {
      if (loadedCount === loadCount) {
        gameLoop();
      }
    },
    100);
}

/********************************/
/**         E   N   D          **/
/********************************/



/********************************/
/**        T I M I N G         **/
/********************************/

var lastTime;
var gameSpeed = 15;

function getElapsedTime() {
  if (!lastTime) {
    lastTime = new Date();
  }

  var now = new Date();

  var elapsed = (now - lastTime);
  lastTime = now;

  return {
    sec: elapsed * gameSpeed / 1000,
    ms: elapsed * gameSpeed,
    absSec: elapsed / 1000,
    absMs: elapsed
  };
}

/********************************/
/**         E   N   D          **/
/********************************/


var gameState = 'start';
var gameStartTime = 0;


function gameStart() {
  player.position = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
  player.rotation = 0;
  player.velocity = {
    x: 0,
    y: 0,
    rotation: 0
  };

  fooList = [];
  fooTimeAccumulate = 0;

  potatoList = [];
  potatoTimeAccumulate = 0;

  fartCount = 8;

  gameStartTime = new Date;

  gameState = 'play';
}


function renderStartScreen() {

}

var fartCount = 8;
var fooIndex = 0;
var fooTimeAccumulate = 0;
var potatoIndex = 0;
var potatoTimeAccumulate = 0;
function renderPlayScreen(viewport, elapsed) {
  fooTimeAccumulate += elapsed.absMs;
  potatoTimeAccumulate += elapsed.absMs;

  if (fooTimeAccumulate > fooFullTime * 1000 / fooDensity) {
  
    fooTimeAccumulate = 0;

    var foo = fooList[fooIndex];
    if (!foo) {
      fooList[fooIndex] = fooParent.clone();
      foo = fooList[fooIndex];
    }

    foo.position.x = Math.random() * canvas.width;
    foo.position.y = Math.random() * canvas.height;

    fooIndex = Math.floor(fooIndex + 1) % fooDensity;
  }
  
  if (potatoTimeAccumulate > potatoFullTime * 1000 / potatoDensity) {
  
    potatoTimeAccumulate = 0;

    var potato = potatoList[potatoIndex];
    if (!potato) {
      potatoList[potatoIndex] = potatoParent.clone();
      potato = potatoList[potatoIndex];
    }

    potato.position.x = Math.random() * canvas.width;
    potato.position.y = Math.random() * canvas.height;

    potatoIndex = Math.floor(potatoIndex + 1) % potatoDensity;
  }

  player.update(elapsed.sec);

  if (player.position.x > canvas.width)
    player.position.x -= canvas.width;
  if (player.position.x < 0)
    player.position.x += canvas.width;
  if (player.position.y > canvas.height + 200) {
    gameState = 'over';
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  viewport.draw(player);

  for (var i in fooList) {
    if (fooList[i] && fooList.hasOwnProperty(i)) {
      var foo = fooList[i];
      
      foo.update(elapsed.sec);
      viewport.draw(foo);

      var dist = Math.sqrt(
        Math.pow(foo.position.x - player.position.x, 2) +
        Math.pow(foo.position.y - player.position.y, 2));

      if (dist < 30) {
        fooList[i] = null;
        gameState = 'over';
      }
    }
  }
  
  for (var i in potatoList) {
    if (potatoList[i] && potatoList.hasOwnProperty(i)) {
      var potato = potatoList[i];
      
      potato.update(elapsed.sec);
      viewport.draw(potato);

      var dist = Math.sqrt(
        Math.pow(potato.position.x - player.position.x, 2) +
        Math.pow(potato.position.y - player.position.y, 2));

      if (dist < 30) {
        potatoList[i] = null;
        fartCount += 5;
      }
    }
  }

  var fartStartOffsetX = canvas.width / 2 - (fartCount * 19) / 2;
  for (var i = 0; i < fartCount; i ++) {
    var offset = fartStartOffsetX + i * 19 + 8.9;
    ctx.translate(offset, 90);
    ctx.drawImage(fart.image, -fart.image.width / 2, -fart.image.height / 2, fart.image.width, fart.image.height);
    ctx.translate(-offset, -90);
  }

  ctx.font = '30px Arial';

  var totalGameTime = new Date - gameStartTime;
  var timeText = durationText(totalGameTime);
  var width = ctx.measureText(timeText).width;

  ctx.fillText(timeText, canvas.width / 2 - width / 2, 60);
}

function renderOverScreen() {

}


function gameLoop() {
  var viewport = new Viewport();

  setInterval(function() {
    var elapsed = getElapsedTime();

    switch(gameState) {
      case 'start':
        renderStartScreen();
        break;
      case 'play':
        renderPlayScreen(viewport, elapsed);
        break;
      case 'over':
        renderOverScreen();
        break;
    }
  }, 16);
}

function durationText(duration) {
  var d = moment.duration(duration);
  var str = '.' + String(Math.floor(d.milliseconds() / 10));

  var sec = d.seconds();
  str = sec + str;
  if (sec < 10)
    str = '0' + str;

  var min = d.minutes();
  if (d.asMinutes() >= 1) {
    str = min + str;
    if (min < 10) 
      str = '0' + str;
  }

  return str;
}


initialize();