const blessed = require('blessed');

var screen = blessed.screen({
    smartCSR: true,
    debug: true,
});

screen.title = 'Змійка';
gameStarted = false;

const menu = blessed.box({
    parent: screen,
    align: 'center',
    top: 'center',
    left: 'center',
    width: 120,
    height: 30,
    border: {
        type: 'line'
    },
    style: {
        fg: 'yellow',
        bg: 'white',
        border: {
            fg: '#f0f0f0'
        },
        hover: {
            bg: 'green'
        }
    }
});


const menuList = blessed.list({
    parent: menu,
    top: 'center',
    left: 'center',
    width: '15%',
    height: '25%',
    keys: true,
    border: {
        type: 'line'
    },
    items: ['Нова гра', 'Вихід'],
    style: {
        selected: {bg: 'blue'},
        item: {fg: 'red', top: 'center'}
    }
});


const difficultyLevel = blessed.list({
    parent: menu,
    hidden: true,
    top: 'center',
    left: 'center',
    width: '15%',
    height: '25%',
    keys: true,
    border: {
        type: 'line'
    },
    items: ['Легкий', 'Середній', 'Складний'],
    text: 'center',
    style: {
        selected: {bg: 'blue'},
        item: {fg: 'red', top: 'center'}
    }
});



const gameBox = blessed.box({
    parent: screen,
    hidden: true,
    top: 'center',
    left: 'center',
    width: 100,
    height: 30,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'blue',
        border: {
            fg: '#f0f0f0'
        },
        hover: {
            bg: 'green'
        }
    }
});



function Snake(position) {
    return blessed.box({
                parent:gameBox,
                width: 1,
                height: 1,
                style: {
                    bg: 'green' //body color
                },
                top: position.y,
                left: position.x
           })
}

let directions = {
    'UP': [0, -1],
    'DOWN': [0, 1],
    'LEFT': [-1, 0],
    'RIGHT': [1, 0]
}

let direction = 'RIGHT'; 
let apple, game, snake, positions;
let appleCounter = 0;
let color = 'black'; //head color
let colors = new Map().set(1, 'yellow').set(2, 'green').set(3, 'blue');
let speed = [125, 80, 40];
let velocity = 125;

screen.render();

function navigateMenuList() {
    switch(menuList.selected) {
        case 1:
            screen.destroy();
            process.exit(0);
        case 0:
            if (gameStarted) {
                gameOver();
            }
            menuList.hide();
            difficultyLevel.show();
            break;
    }  
}

function navigateDifficultyLevel() {
    switch(difficultyLevel.selected) {
        case 0:
            velocity = speed[0];
            gameBox.width = 50;
            gameBox.height = 20;
            break;
        case 1:
            velocity = speed[1];
            gameBox.width = 80;
            gameBox.height = 25;
            break;
        case 2:
            velocity = speed[2];
            gameBox.width = 100;
            gameBox.height = 30;
            break;
    }
    difficultyLevel.hide();
    gameBox.show();
    createSnake();
    gameStarted = true;
    startGame();
}

function createSnake() {
    snake = [];
    positions = [];
    for (let i = 0; i < 2; i++) {
        positions.push({x: 10 + i, y: 10});
        snake[i] = Snake(positions[i]);
    }
}

function createApple() {
    let x = Math.floor(Math.random() * (gameBox.width - 3));
    let y = Math.floor(Math.random() * (gameBox.height - 3));
    i = 0;
    while (i < positions.length) {
        if (x == positions[i].x || y == positions[i].y) {
            x = Math.floor(Math.random() * (gameBox.width - 3));
            y = Math.floor(Math.random() * (gameBox.height - 3));
            i = 0
        } else i++;
    }
    return blessed.box({
        parent: gameBox,
        width: 1,
        height: 1,
        top: y,
        left: x,
        style: {
            'bg': 'red'
        }
    })
}

function changeState() {
    let lastNode = positions[positions.length - 1];
    let newX = lastNode.x + directions[direction][0];
    let newY = lastNode.y + directions[direction][1];
    for (let i of snake) {
        i.detach();
    }
    positions.push({x: newX, y: newY});
    if (newX == apple.left - 1 && newY == apple.top - 1) {
        appleCounter++;
        apple.detach();
        apple = createApple();
    } else positions.shift();
    for (let i = 0; i < positions.length; i++) {
        snake[i] = Snake(positions[i]);
    }
    if (appleCounter != 0 && appleCounter % 3 == 0) {
        changeHeadColor(parseInt(appleCounter / 3));
    }
    snake[snake.length - 1].style.bg = color;
    checkForBite();
    checkForGameOver();
    screen.render();
}

function changeHeadColor(num) {
    color = colors.get(num);
    if (num == 3) appleCounter = 0;
}

function checkForBite() {
    let head = positions[positions.length - 1];
    for (let i = 0; i < positions.length - 1; i++) {
        if (positions[i].x == head.x && positions[i].y == head.y) {
            gameOver();
        }
    }
}

function checkForGameOver() {
    let head = positions[positions.length - 1];
    if (head.x >= gameBox.width - 2 || head.x < 0) {
        gameOver()
    } else if (head.y >= gameBox.height - 2 || head.y < 0) {
        gameOver()
    }
}

function gameOver() {
    gameStarted = false;
    clearInterval(game);
    for (let block of snake) {
        block.detach();
    }
    apple.detach();
    direction = 'RIGHT';
    color = 'black';
    appleCounter = 0;
    gameBox.hide();
    menuList.show();
    screen.render();
}

function startGame() {
    apple = createApple();
    screen.render();
    game = setInterval(changeState, velocity);
}

screen.key('down', function(ch, key) {
    let properList = menuList.hidden ? difficultyLevel : menuList;
    if (gameBox.hidden === true) {
        if (properList.selected !== 2) properList.down(1)
        else properList.selected = 0;
    } else {
        if (gameStarted && game && direction != 'UP') {
            direction = 'DOWN';
        }
    }
});

screen.key('up', function(ch, key) {
    let properList = menuList.hidden ? difficultyLevel : menuList;
    if (gameBox.hidden === true) {
        if (properList.selected !== 0) properList.up(1)
        else properList.selected = 2;
    } else if (!gameBox.hidden) {
        if (gameStarted && game && direction != 'DOWN') {
            direction = 'UP';
        }
    }
});

screen.key('left', function(ch, key) {
    if (gameStarted && game && direction != 'RIGHT') {
        direction = 'LEFT';
    }
})

screen.key('right', function(ch, key) {
    if (gameStarted && game && direction != 'LEFT') {
        direction = 'RIGHT';
    }
})

screen.key('enter', function(ch, key) {
    if (gameBox.hidden) {
        if (!menuList.hidden) {
            navigateMenuList();
        } else {
            navigateDifficultyLevel();
        }
    }
    screen.render();
})


screen.key(['escape', 'q'], function(ch, key) {
    this.destroy();
    process.exit(0);
})

screen.key('backspace', function(ch, key) {
    if (gameStarted && game) {
        clearInterval(game);
        gameBox.hide();
        menuList.show();
        screen.render();
    } else if (!difficultyLevel.hidden) {
        difficultyLevel.hide();
        menuList.show();
        screen.render();
    }
})
