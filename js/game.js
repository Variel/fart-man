var canvas = document.getElementById('game-view');
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize',
  function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

var power = 70;

window.addEventListener('keydown',
  function (e) {
    if (e.keyCode === 32) {

      player.velocity.y = Math.sin(player.rotation - Math.PI / 2) * power;
      player.velocity.x = Math.cos(player.rotation - Math.PI / 2) * power;

      if (player.rotation <= 0) {
        player.velocity.rotation = -0.55;
      } else {
        player.velocity.rotation = 0.55;
      }
    }
  });

window.addEventListener('touchstart',
  function() {
    player.velocity.y = Math.sin(player.rotation - Math.PI / 2) * power;
    player.velocity.x = Math.cos(player.rotation - Math.PI / 2) * power;

    if (player.rotation <= 0) {
      player.velocity.rotation = -0.55;
    } else {
      player.velocity.rotation = 0.55;
    }
  });

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

var player = new GameObject();
player.position = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};
player.velocity = {
  x: 0,
  y: 0,
  rotation: 0
};

var fooParent = new GameObject();
fooParent.gravity = 0;
var fooList = [];

function initialize() {
  loadItem('./img/player.png', player, 'image');
  loadItem('./img/foo.png', fooParent, 'image');
}

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

var lastTime;
var speed = 15;

function getElapsedTime() {
  if (!lastTime) {
    lastTime = new Date();
  }

  var now = new Date();

  var elapsed = (now - lastTime) * speed;
  lastTime = now;

  return {
    sec: elapsed / 1000,
    ms: elapsed
  };
}


function gameLoop() {
  var viewport = new Viewport();

  setInterval(function() {
    var elapsed = getElapsedTime();

    player.update(elapsed.sec);

    if (player.position.x > canvas.width)
      player.position.x -= canvas.width;
    if (player.position.x < 0)
      player.position.x += canvas.width;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    viewport.draw(player);

    for (var i in fooList) {
      if (fooList[i] && fooList.hasOwnProperty(i)) {
        var foo = fooList[i];
        
        foo.update(elapsed.sec);
        viewport.draw(foo);

        var dist = Math.sqrt(Math.pow(foo.position.x - player.position.x, 2) +
          Math.pow(foo.position.y - player.position.y, 2));

        if (dist < 30) {
          fooList[i] = null;
          console.error('bump!');
        }
      }
    }

  }, 16);
}

var fooIndex = 0;
setInterval(function() {
    var foo = fooList[fooIndex];
    if (!foo) {
      fooList[fooIndex] = fooParent.clone();
      foo = fooList[fooIndex];
    }

    foo.position.x = Math.random() * canvas.width;
    foo.position.y = Math.random() * canvas.height;

    fooIndex = (fooIndex + 1) % 3;
  },
  5000);

initialize();