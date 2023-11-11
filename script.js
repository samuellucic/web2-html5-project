// maksimalna brzina asteroida
const MAX_SPEED = 2;
// maksimalan broj asteroida na canvasu
const MAX_ASTEROIDS = 200;
// početni broj asteroida
const ASTEROID_STARTING_NUM = 30;
// šansa za generiranjem novog asteroida svaki rerender
// 2.5 asteroida/s
const GEN_CHANCE = 0.05;
// granice nakon čega se asteroid briše iz memorije
const BORDER_X_MIN = -200;
const BORDER_Y_MIN = -200;
const BORDER_X_MAX = document.getElementById('game').clientWidth + 200;
const BORDER_Y_MAX = document.getElementById('game').clientHeight + 200;

class GameArea {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game-canvas';
    this.context = this.canvas.getContext('2d');
    this.asteroids = [];
    this.canvas.width = document.getElementById('game').clientWidth;
    this.canvas.height = document.getElementById('game').clientHeight;
  }

  start = () => {
    document
      .getElementById('game')
      .insertBefore(this.canvas, document.getElementById('game').childNodes[0]);
    this.startTime = new Date();
    this.interval = setInterval(updateGameArea, 20);
    this.isRunning = true;
  };

  stop = () => {
    // zaustavljanje rerendera
    clearInterval(this.interval);

    // ukupno odigrano vrijeme
    const timeElapsed = new Date() - this.startTime;
    const localStorageTimeElapsed = getBestTimeFromLocalStorage();
    if (timeElapsed > localStorageTimeElapsed) {
      localStorage.setItem('bestTime', timeElapsed);
    }
  };

  clear = () => {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  // crtanje teksta vremena na canvas
  updateTime = () => {
    const bestTimeElapsed = getBestTimeFromLocalStorage();
    const bestTimeElapsedText = intervalToString(bestTimeElapsed);
    const timeElapsed = new Date() - this.startTime;
    const timeElapsedText = intervalToString(timeElapsed);

    const bestTimeText = `Najbolje vrijeme: ${bestTimeElapsedText}`;
    const timeText = `Vrijeme: ${timeElapsedText}`;

    const ctx = this.context;
    const bestTimeTextMeasures = ctx.measureText(bestTimeText);
    const timeTextMeasures = ctx.measureText(timeText);

    // crtanje teksta u gornji desni kut canvasa
    ctx.font = '30px Arial';
    ctx.fillText(
      bestTimeText,
      this.canvas.width - bestTimeTextMeasures.width - 20,
      20 + bestTimeTextMeasures.actualBoundingBoxAscent
    );
    ctx.fillText(
      timeText,
      this.canvas.width - timeTextMeasures.width - 20,
      20 +
        bestTimeTextMeasures.actualBoundingBoxAscent +
        20 +
        timeTextMeasures.actualBoundingBoxAscent
    );
  };

  generateAsteroid = () => {
    const size = getRandomInt(20, 100);

    // nasumično biranje pozicije
    // 0 = gore
    // 1 = lijevo
    // 2 = dolje
    // 3 = desno
    const position = getRandomInt(0, 3);
    let x;
    let y;
    let speed_x;
    let speed_y;
    // nasumično pozicioniranje asteroida u odnosu na poziciju stvaranja
    // i generiranje njihove brzine tako da ne idu u smjerovima suprotno od canvasa
    // i da nisu nikad brži od igrača
    switch (position) {
      case 0:
        x = getRandomInt(0, this.canvas.width);
        y = getRandomInt(-150, -100);
        speed_y = Math.random() * MAX_SPEED;
        speed_x = Math.random() * (MAX_SPEED * 0.8) * 2 - MAX_SPEED * 0.8;
        break;
      case 1:
        x = getRandomInt(-150, -100);
        y = getRandomInt(0, this.canvas.height);
        speed_y = Math.random() * (MAX_SPEED * 0.8) * 2 - MAX_SPEED * 0.8;
        speed_x = Math.random() * MAX_SPEED;
        break;
      case 2:
        x = getRandomInt(0, this.canvas.width);
        y = getRandomInt(this.canvas.height + 100, this.canvas.height + 150);
        speed_y = -Math.random() * MAX_SPEED;
        speed_x = Math.random() * (MAX_SPEED * 0.8) * 2 - MAX_SPEED * 0.8;
        break;
      case 3:
        x = getRandomInt(this.canvas.width + 100, this.canvas.width + 150);
        y = getRandomInt(0, this.canvas.height);
        speed_y = Math.random() * (MAX_SPEED * 0.8) * 2 - MAX_SPEED * 0.8;
        speed_x = -Math.random() * MAX_SPEED;
        break;
    }

    // nasumično biranje sive boje iz raspona
    const colorRGBNum = 128 + getRandomInt(-20, 20);

    // kreacija asteroida
    const asteroid = new Component(
      size,
      `rgb(
        ${colorRGBNum},
        ${colorRGBNum},
        ${colorRGBNum})`,
      'black',
      x,
      y,
      speed_x,
      speed_y,
      this
    );
    // dodavanje asteroida u kontekst igre gdje
    this.asteroids.push(asteroid);
  };
}

// dohvat najboljeg vremena iz local storage
// ako nije pravi broj ili ne postoji, onda se upisuje pretpostavljena vrijednost 0
// vrijeme u local storage zapisuje se kao interval u milisekundama
const getBestTimeFromLocalStorage = () => {
  const bestTimeElapsedStorage = localStorage.getItem('bestTime') ?? 0;
  return (bestTimeElapsed = /^[0-9]+$/.test(bestTimeElapsedStorage)
    ? parseInt(bestTimeElapsedStorage)
    : 0);
};

// pretvorba intervala u milisekundama u format (minute:sekunde.milisekunde)
const intervalToString = (interval) => {
  const intervalMillis = Math.floor(interval % 1000);
  const intervalSeconds = Math.floor(interval / 1000) % 60;
  const intervalMinutes = Math.floor(Math.floor(interval / 1000) / 60);

  return `${intervalMinutes.toString().padStart(2, '0')}:${intervalSeconds
    .toString()
    .padStart(2, '0')}.${intervalMillis.toString().padStart(3, '0')}`;
};

class Component {
  constructor(size, color, styleColor, x, y, speed_x, speed_y, gameArea) {
    this.size = size;
    this.color = color;
    this.styleColor = styleColor;
    this.x = x;
    this.y = y;
    this.speed_x = speed_x;
    this.speed_y = speed_y;
    this.gameArea = gameArea;
  }

  // ažuriranje pozicije
  newPos = () => {
    this.x += this.speed_x;
    this.y += this.speed_y;
  };

  // crtanje ažurirane pozicije komponente na canvas
  update = () => {
    const ctx = this.gameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.shadowColor = '#525050';
    ctx.shadowBlur = 8;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.size / -2, this.size / -2, this.size, this.size);

    ctx.strokeStyle = this.styleColor;
    ctx.strokeRect(this.size / -2, this.size / -2, this.size, this.size);
    ctx.restore();
  };
}

// nasumično generiranje cijelog broja unutar danog raspona
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min) + min);
};

// instanciranje konteksta igre
const gameArea = new GameArea();
// instanciranje igrača
const player = new Component(
  30,
  'red',
  '#800000',
  document.getElementById('game').clientWidth / 2,
  document.getElementById('game').clientHeight / 2,
  0,
  0,
  gameArea
);

// pokretanje igre
const startGame = () => {
  // generiranje početnih asteroida
  for (let i = 0; i < ASTEROID_STARTING_NUM; i++) {
    gameArea.generateAsteroid();
  }
  // pokretanje konteksta igre
  gameArea.start();
};

// ažuriranje konteksta
const updateGameArea = () => {
  gameArea.clear();
  updateGameAreaComponents();
  gameArea.updateTime();
};

const updateGameAreaComponents = () => {
  // generiranje novog asteroida
  if (
    Math.random() <= GEN_CHANCE &&
    gameArea.asteroids.length <= MAX_ASTEROIDS
  ) {
    gameArea.generateAsteroid();
  }

  // ažuriranje pozicija i brisanje asteroida koji su izašli izvan granica
  player.newPos();

  const asteroids = gameArea.asteroids;
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    asteroid.newPos();
    if (
      (asteroid.x <= BORDER_X_MIN || asteroid.x >= BORDER_X_MAX) &&
      (asteroid.y <= BORDER_Y_MIN || asteroid.y >= BORDER_Y_MAX)
    ) {
      asteroids.splice(i, 1);
    }
  }

  // crtanje novih pozicija i provjera je li došlo do kraja igre
  let isCollision = false;
  player.update();
  for (const asteroid of gameArea.asteroids) {
    asteroid.update();
    if (checkCollision(player, asteroid)) {
      isCollision = true;
    }
  }

  if (isCollision) {
    gameArea.stop();
  }
};

// priprema podataka potrebnih za provjeru kolizije
const checkCollision = (component1, component2) => {
  const component1SizeHalved = component1.size / 2;
  const component2SizeHalved = component2.size / 2;

  const component1Vertices = {
    xMin: component1.x - component1SizeHalved,
    xMax: component1.x + component1SizeHalved,
    yMin: component1.y - component1SizeHalved,
    yMax: component1.y + component1SizeHalved,
  };
  const component2Vertices = {
    xMin: component2.x - component2SizeHalved,
    xMax: component2.x + component2SizeHalved,
    yMin: component2.y - component2SizeHalved,
    yMax: component2.y + component2SizeHalved,
  };

  return (
    isInBox(component1Vertices, component2Vertices) ||
    isInBox(component2Vertices, component1Vertices)
  );
};

// provjera je li jedan objekt unutar drugoga
const isInBox = (component1Vertices, component2Vertices) => {
  return (
    (isInRange(
      component1Vertices.xMin,
      component1Vertices.xMax,
      component2Vertices.xMin
    ) ||
      isInRange(
        component1Vertices.xMin,
        component1Vertices.xMax,
        component2Vertices.xMax
      )) &&
    (isInRange(
      component1Vertices.yMin,
      component1Vertices.yMax,
      component2Vertices.yMin
    ) ||
      isInRange(
        component1Vertices.yMin,
        component1Vertices.yMax,
        component2Vertices.yMax
      ))
  );
};

// provjera je li točka objekta unutar zadanog raspona
const isInRange = (rangeStart, rangeEnd, value) => {
  return rangeStart <= value && value <= rangeEnd;
};

// ova dva promatrača mijenjaju smjer igraču
document.body.addEventListener('keydown', (element) => {
  switch (element.key) {
    case 'ArrowUp':
      player.speed_y = -MAX_SPEED;
      break;
    case 'ArrowDown':
      player.speed_y = MAX_SPEED;
      break;
    case 'ArrowLeft':
      player.speed_x = -MAX_SPEED;
      break;
    case 'ArrowRight':
      player.speed_x = MAX_SPEED;
      break;
  }
});
document.body.addEventListener('keyup', (element) => {
  switch (element.key) {
    case 'ArrowUp':
      player.speed_y = 0;
      break;
    case 'ArrowDown':
      player.speed_y = 0;
      break;
    case 'ArrowLeft':
      player.speed_x = 0;
      break;
    case 'ArrowRight':
      player.speed_x = 0;
      break;
  }
});
