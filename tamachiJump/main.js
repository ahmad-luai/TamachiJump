// Get the canvas element and its 2D context
const enemy = document.querySelector('.enemy');
const char = document.querySelector('.char');
const bomb = document.querySelector('.bomb');
const fire = document.querySelector('.fire');
const bullet1 = document.querySelector('.bullet1');
const bullet2 = document.querySelector('.bullet2');
const jump = document.querySelector('.jumpPlatform');
const jump2 = document.querySelector('.jumpPlatform2');
const normal = document.querySelector('.normalPlatform');
const launch = document.querySelector('.launchPlatform');
const lavaTextures = [
	document.querySelector('.lavaTexture1'),
	document.querySelector('.lavaTexture2'),
	document.querySelector('.lavaTexture3'),
];
const canvas = document.querySelector('.gameCanvas');
canvas.width = 404;
canvas.height = (canvas.width * 16) / 9;
const ctx = canvas.getContext('2d');
const colors = {
	background: '#3366ff',
	char: '#fcfcfc',
	platform_jump: '#f7f8fc',
	platform_normal: '#050505',
	platform_launch: '#df4716',
	lava: '#df4716',
	bomb: '#000000',
};

const platformHeight = canvas.height * 0.015;
const platformWidth = canvas.width / 10;

let leftPressed = false;
let rightPressed = false;
let downPressed = false;
let downCoolDown = false;
let cameraY = [];
for (let i = 0; i < 25; i++) {
	cameraY.push(0);
}
// Listen for keydown and keyup events to track arrow key presses
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
	if (e.key === 'Right' || e.key === 'ArrowRight') {
		rightPressed = true;
	} else if (e.key === 'Left' || e.key === 'ArrowLeft') {
		leftPressed = true;
	} else if (e.key === 'Down' || e.key === 'ArrowDown') {
		downPressed = true;
	}
}

function keyUpHandler(e) {
	if (e.key === 'Right' || e.key === 'ArrowRight') {
		rightPressed = false;
	} else if (e.key === 'Left' || e.key === 'ArrowLeft') {
		leftPressed = false;
	} else if (e.key === 'Down' || e.key === 'ArrowDown') {
		downPressed = false;
	}
}
class Lava {
	constructor() {
		this.height = canvas.height;
		this.default = 0;
		this.y = 0;
		this.width = canvas.width;
		this.x = 0;
		this.velocityY = 0.1;
		this.disp = 0;
		this.sprite = 1;
	}

	checkLava() {
		let s = this.y - platforms.filter(x => x.floor == currFloor + 4)[0].y > 30;
		return s;
	}

	setLava() {
		this.default = platforms.filter(x => x.floor == currFloor + 4)[0].y + 100;
	}

	update() {
		this.y = this.default;
		if (currFloor < 0) {
			this.default -= this.velocityY;
		}
		this.height = canvas.height;
	}

	draw(camera) {
		ctx.fillStyle = colors.lava;
		ctx.fillRect(this.x + camera.x, this.y + camera.y, this.width, this.height);
		ctx.drawImage(lavaTextures[this.sprite], -20 + camera.x, this.y + camera.y - 10);
	}
}
function isCollisionForBomb(smallBox, bigBox) {
	if (bigBox.dontCollide == false) {
		let x = bigBox.x - smallBox.x;
		let y = bigBox.y + bigBox.height - smallBox.y;
		d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		if (x > 0) {
			if (d < Character.width + currbomb.width) {
				true;
				return true;
			}
		}
	}
}

class CharacterObj {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = 29;
		this.gravity = 0.3;
		this.velocityY = 0;
		this.velocityX = 3.5;
		this.collidedWith = { x: null };
		this.negVelocity = 7.1;
		this.bomb = false;
		this.dontCollide = false;
	}
	isColliding(platform) {
		return (
			this.velocityY > 0 &&
			this.x + this.width / 2 < platform.x + platform.width &&
			this.x + this.width / 2 > platform.x &&
			this.y + this.height - this.velocityY <= platform.y &&
			this.y < platform.y + platform.height &&
			this.y + this.height > platform.y
		);
	}

	isLost() {
		return this.y + this.height > lava.y;
	}

	update() {
		if (leftPressed) {
			this.x -= this.velocityX;
		}
		if (rightPressed) {
			this.x += this.velocityX;
		}

		if (isCollisionForBomb(currbomb, this)) {
			this.bomb = true;
		}

		if (this.bomb) {
			currbomb.x = this.x - 15;
			currbomb.y = this.y;
		}

		let collided = false;
		platforms.forEach(platform => {
			if (this.isColliding(platform)) {
				if (platform.type == 'launch' && this.bomb == true) {
					removeFloor();
					// platform.changeLaunch();
					this.dontCollide = true;
					this.bomb = false;
					currbomb.x = platform.x;
					currbomb.y = platform.y;
					setTimeout(() => {
						platform.type = 'normal';
					}, 2000);
				}
				if (platform.type == 'jump') {
					platform.changeState();
					collided = true;
					this.collidedWith = platform;
					this.velocityY = 0;
					this.y = platform.y - this.height;
				} else {
					if (downCoolDown == false) {
						collided = true;
						this.collidedWith = platform;
						this.velocityY = 0;
						this.y = platform.y - this.height;
					}
				}
			}
		});

		if (downPressed) {
			downCoolDown = true;
			setTimeout(() => {
				downCoolDown = false;
			}, 200);
		}

		if (collided == true && this.collidedWith['type'] == 'jump') {
			this.velocityY -= this.negVelocity;
		}
		if (this.y + this.height > canvas.height) {
			this.y = 0;
			this.velocityY = 0;
		}
		this.velocityY += this.gravity;
		this.y += this.velocityY;

		if (this.x < 0) {
			this.x = canvas.width - this.width;
		}
		if (this.x + this.width > canvas.width) {
			this.x = 0;
		}

		cameraY.push(this.y);
	}
	draw(camera) {
		ctx.drawImage(char, this.x + camera.x, this.y + camera.y);
	}
}

class PlatformObj {
	constructor(x, y, width, height, type, floor, canLaunch, islandSide) {
		this.type = type;
		this.x = x;
		this.width = width;
		this.height = height;
		this.floor = floor;
		this.y = this.floor * 60 + 200;
		this.opacity = 1;
		this.remove = false;
		this.state = 1;
		this.canLaunch = canLaunch;
		this.islandSide = islandSide;
	}

	changeState() {
		this.state = 2;
		setTimeout(() => {
			this.state = 1;
		}, 200);
	}
	removeLastFloor() {
		if (this.floor == currFloor + 4) {
			return true;
		}
	}

	update() {
		if (this.remove) {
			if (this.opacity < 0) {
				this.opacity = 0;
			} else {
				this.opacity -= 0.1;
			}
		}

		this.y = this.floor * 60 + 200;
	}

	draw(camera) {
		ctx.globalAlpha = this.opacity;
		ctx.fillStyle = colors.platform_normal;
		if (this.type == 'jump') {
			if (this.state == 1) {
				ctx.drawImage(jump, this.x + camera.x, this.y + camera.y);
			}

			if (this.state == 2) {
				ctx.drawImage(jump2, this.x + camera.x, this.y - 6 + camera.y);
			}
		}
		if (this.type == 'launch') {
			ctx.drawImage(launch, this.x + camera.x, this.y + camera.y);
		}
		if (this.type == 'normal') {
			ctx.drawImage(normal, this.x + camera.x, this.y + camera.y);
		}
		// ctx.fillRect(this.x + camera.x, this.y + camera.y, this.width, this.height);
		ctx.globalAlpha = 1;
	}
}

const Character = new CharacterObj(100, 0, 15, 15);

let platforms = [];

function GenerateFloor(f) {
	let numOfFloors = Math.floor(Math.random() * 2) + 2;
	// let numOfFloors = 4;
	let h = f * 60 + 200;
	let numOfJumps = 0;
	let t = 'normal';
	for (let i = 0; i < numOfFloors; i++) {
		let x = i * platformWidth + 20;
		t = 'normal';

		if (Math.random() > 0.5 && numOfJumps <= 2) {
			t = 'jump';
		}
		if (numOfJumps == 0) {
			t = 'jump';
		}
		if (t == 'jump') {
			numOfJumps += 2;
		}
		canBe = true;
		if (numOfJumps == 1) {
			canBe = false;
		}
		platforms.push(new PlatformObj(x, h, platformWidth, platformHeight, t, f, canBe, 'left'));
		platforms.push(
			new PlatformObj(
				canvas.width - 20 - x - platformWidth,
				h,
				platformWidth,
				platformHeight,
				t,
				f,
				canBe,
				'right',
			),
		);
	}

	if (Math.random() < 0.6) {
		if (Math.random() > 0.3) {
			platforms.push(
				new PlatformObj(
					canvas.width / 2 - platformWidth / 2,
					h,
					platformWidth,
					platformHeight,
					'jump',
					f,
					false,
				),
			);
		}
	}
	if (numOfJumps == 0) {
		platforms.push(
			new PlatformObj(
				canvas.width / 2 - platformWidth / 2,
				h,
				platformWidth,
				platformHeight,
				'jump',
				f,
				true,
			),
		);
	}
}

GenerateFloor(1);
GenerateFloor(2);
GenerateFloor(3);
GenerateFloor(4);

let currFloor = 0;

function chooseLaunch() {
	function splitByFloor(platforms) {
		const result = [];
		let currentArray = [];

		platforms.forEach(item => {
			// Check if currentArray is empty or if the floor matches the first item in the currentArray
			if (currentArray.length === 0 || currentArray[0].floor === item.floor) {
				currentArray.push(item);
			} else {
				// If floor doesn't match, start a new array
				result.push(currentArray);
				currentArray = [item];
			}
		});

		// Add the last array to the result
		if (currentArray.length > 0) {
			result.push(currentArray);
		}

		return result;
	}

	function splitBySide(floor) {
		let islandLeft = [];
		let islandRight = [];
		floor.forEach(x => {
			if (x.islandSide == 'left') {
				islandLeft.push(x);
			} else {
				islandRight.push(x);
			}
		});
		return [islandLeft, islandRight];
	}

	platforms.forEach(x => {
		if (x.type == 'launch') {
			x.type = 'normal';
		}
	});

	let platformsIsntance = splitByFloor(platforms.filter(x => x.canLaunch))
		.map(x => splitBySide(x))
		.map(x => x[0]);

	let chosenplatform;
	let orderOfFloors = [0, 1, 2, 3];
	orderOfFloors = orderOfFloors.sort(() => Math.random() - 0.5);
	console.log(orderOfFloors);
	doesLastFloorHaveJump = false;
	if (platformsIsntance[3].filter(x => x.type == 'jumo').length > 0) {
		doesLastFloorHaveJump = true;
	}
	function pick(island, index) {
		let numberOfJumps = island.filter(x => x.type == 'jump').length;
		if (numberOfJumps <= 1 && index != 3 && doesLastFloorHaveJump) {
			return island[Math.floor(Math.random() * (island.length - 1))];
		}
		if (numberOfJumps > 1) {
			return island[Math.floor(Math.random() * (island.length - 1))];
		}

		if (index == 3 && numberOfJumps == 1) {
			console.log('bail');
			return 'bail';
		}
	}

	for (let i = 0; i < orderOfFloors.length; i++) {
		if (pick(platformsIsntance[orderOfFloors[i]])) {
			chosenplatform = pick(platformsIsntance[orderOfFloors[i]]);
			break;
		} else {
			chosenplatform = platformsIsntance[0][0][0];
		}
	}

	console.log(platformsIsntance);
	if (chosenplatform == undefined) {
		platformsIsntance[0][0][0];
	}
	console.log(chosenplatform);
	function recurse() {
		if (chosenplatform == undefined) {
			pick(platformsIsntance[orderOfFloors[Math.floor(Math.random() * 2)]]);
		} else {
			return;
		}
	}
	recurse();
	platforms.filter(x => {
		return x.x == chosenplatform.x && x.y == chosenplatform.y;
	})[0]['type'] = 'launch';
}

function removeFloor() {
	platforms.filter(x => x.removeLastFloor() == true).forEach(x => (x.remove = true));

	setTimeout(() => {
		platforms = platforms.filter(x => x.removeLastFloor() != true);
		GenerateFloor(currFloor);
		currFloor--;
		chooseLaunch();
		// lava.setLava();
		currbomb.chooseBomb();
		Character.dontCollide = false;
	}, 2000);
}

class Bomb {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = 10;
		this.height = 10;
	}

	chooseBomb() {
		let temp = platforms.filter(x => x.type != 'launch' && x.type != 'jump');
		temp = temp[Math.floor(Math.random() * (temp.length - 1))];
		this.x = temp.x;
		this.y = temp.y;
	}
	draw(camera) {
		ctx.fillStyle = colors.bomb;
		ctx.drawImage(
			bomb,
			this.x - 5 + platformWidth / 2 + camera.x,
			this.y - platformHeight + camera.y - 12,
		);
	}
}
chooseLaunch();

let currbomb = new Bomb();
currbomb.chooseBomb();
let currframe = 0;
let cam = { x: 0, y: canvas.height / 2 - cameraY[currframe + 20] + 20 };
// Game loop function
function gameLoop() {
	// Clear the canvas for the next frame
	ctx.fillStyle = colors.background;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Update game state (character position, enemy position, etc.)
	cam = { x: 0, y: canvas.height / 2 - cameraY[currframe + 20] + 20 };
	updateGame(cam);

	// Draw game elements

	drawGame(cam);

	// Request the next animation frame
	currframe++;
	requestAnimationFrame(gameLoop);
}
let lava = new Lava();
lava.setLava();
// Function to update the game state

class ImageC {
	constructor(x, y, type, parent, sprite) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.sprite = sprite;
		this.parent = parent;
	}
	update() {
		this.x = this.parent['x'];
		this.y = this.parent['y'];
	}
	draw(camera) {
		if (this.type == 'char') {
			ctx.drawImage(char, this.x + camera.x, this.y + camera.y);
		}

		if (this.type == 'bomb') {
			ctx.drawImage(bomb, this.x + camera.x, this.y + camera.y);
		}

		if (this.type == 'normal') {
			ctx.drawImage(normal, this.x + camera.x, this.y + camera.y);
		}

		if (this.type == 'jump') {
			ctx.drawImage(jump, this.x + camera.x, this.y + camera.y);
		}

		if (this.type == 'launch') {
			ctx.drawImage(launch, this.x + camera.x, this.y + camera.y);
		}
	}
}

let lavaCurrSprite = 1;
setInterval(() => {
	lavaCurrSprite++;
	lava.sprite = lavaCurrSprite % 3;
}, 500);

class Enemy {
	constructor(x, y) {
		this.x = canvas.width / 2;
		this.y = 150;
		this.time = 0;
	}
	update() {
		// this.x
		this.time++;
	}
	draw(camera) {
		ctx.drawImage(enemy, this.x - 51 + Math.sin(0.02 * this.time) * 30, this.y);
	}
}

class FireBall {
	constructor(x, y, type, target, camm) {
		this.y = enemyCan.y - camm.y + 30;
		this.type = type;
		this.x = enemyCan.x;
		this.frame = 0;
		this.allFrames = 100;
		this.target = target;
		this.width = 17;
		this.height = 17;
		this.remove = false;
		this.velocity = 3;
		this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x); // Use atan2 to calculate angle
		this.xHistory = [];
		this.yHistory = [];
	}

	isKill() {
		if (
			this.x + this.width / 2 > Character.x &&
			this.x < Character.x + Character.width &&
			this.y > Character.y &&
			this.y < Character.y + Character.height
		) {
			Character.y = canvas.height;
		}
	}
	update() {
		// Calculate direction vector
		let directionX = Math.cos(this.angle);
		let directionY = Math.sin(this.angle);

		// Update firebowl position
		this.x += directionX * this.velocity;
		this.y += directionY * this.velocity;

		this.xHistory.push(this.x);
		this.yHistory.push(this.y);
	}

	draw(camera) {
		ctx.fillStyle = colors.platform_normal;

		for (let i = 0; i < 5; i++) {
			ctx.globalAlpha = 1 / i;
			ctx.drawImage(
				fire,
				this.xHistory[this.xHistory.length - i * 5],
				this.yHistory[this.yHistory.length - i * 5] + camera.y,
				12 / i + 10,
				12 / i + 10,
			);
		}

		ctx.globalAlpha = 1;

		// ctx.fillRect(this.x, this.y + camera.y, this.width, this.height);
	}
}
let oneFire;

setInterval(() => {
	oneFire = new FireBall(
		0,
		0,
		'fire',
		{ x: Character.x, y: Character.y },
		{ x: cam.x, y: cam.y },
	);
}, 3000);

class Bullet {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.state = true;
		this.velocity = 4;
		this.remove = false;
	}
	update(camera) {
		this.y -= this.velocity;

		setInterval(() => {
			this.state = !this.state;
		}, 100);
		if (this.y < -50 - camera.y) {
			this.remove = true;
		}
	}
	draw(camera) {
		if (this.state == true) {
			ctx.drawImage(bullet1, this.x, this.y + camera.y);
		} else {
			ctx.drawImage(bullet2, this.x, this.y + camera.y);
		}
	}
}

let numofBullets = 0;
let bullets = [];
let intervalid = setInterval(() => {
	if (numofBullets == 20) {
		clearInterval(intervalid);
	} else {
		// bullets.push(new Bullet(Character.x, Character.y));
		numofBullets++;
	}
}, 400);

function updateGame(camera) {
	if (!Character.isLost()) {
		Character.update();
	}
	lava.update();
	if (oneFire) {
		oneFire.update(camera);
		oneFire.isKill();
	}
	enemyCan.update(camera);
	platforms.forEach(x => x.update());
	bullets.forEach((x, i) => {
		x.update(camera);
		if (x.remove == true) {
			bullets.splice(i, 1);
		}
	});
	// Update character position, enemy position, etc.
}

let enemyCan = new Enemy(0, 0);
// Function to draw game elements
function drawGame(camera) {
	platforms.forEach(x => x.draw(camera));
	currbomb.draw(camera);
	if (!Character.isLost()) {
		Character.draw(camera);
	}
	if (oneFire) {
		oneFire.draw(camera);
	}
	lava.draw(camera);
	enemyCan.draw(camera);
	console.log(bullets);
	bullets.forEach(x => x.draw(camera));

	// Draw character, platforms, enemy, etc.
}

// Start the game loop
requestAnimationFrame(gameLoop);
