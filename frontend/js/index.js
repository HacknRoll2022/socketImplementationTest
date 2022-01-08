const width = 10;
const user1Grid = document.querySelector('.grid-user1');
const user1Squares = []
const plants = [['', 'carrot_plant.png','carrot_grow.png','carrot_rot.png'], ['', 'radish_plant.png','radish_grow.png','radish_rot.png']]
const p1Score_el = document.getElementById('p1_score');
const p2Score_el = document.getElementById('p2_score');
const p1Turn = document.getElementById('player1_turn');
const p2Turn = document.getElementById('player2_turn');
const playerNumber = 1; // need to set in function later
const maxState = 10;


/////////////////////////////////////////////////////////////////////////////////////////////////////

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
    socket.emit('newGame');
    init();
  }

  function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
  }
  
  
/////////////////////////////////////////////////////////////////////////////////////////////////////


var gameState = 0; // what values to use?
var gameData = [];
var scoreData = [];
var gridData = [];
var p1Score = 0;
var p2Score = 0;
var playerTurn = 0;

var gameActive = false;

/////////////////////////////////////////////////////////////////////////////////////////////////////
// socket.io stuff

//
// const socket = io('https://dunno.herokuapp.com/'); // use our heroku app when hosting later on
const socket = io("http://localhost:3000/")

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);


function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) {
      return;
    }
    gameData = JSON.parse(gameState);
    playerTurn = gameState.turn 
}

function handleGameOver(data) {
    if (!gameActive) {
      return;
    }
    data = JSON.parse(data);
  
    gameActive = false;
  
    if (data.winner === playerNumber) {
      alert('You Win!');
    } else {
      alert('You Lose :(');
    }
  }

  
function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
  }
  

  function handleUnknownCode() {
    reset();
    alert('Unknown Game Code')
  }
  
  function handleTooManyPlayers() {
    reset();
    alert('This game is already in progress');
  }
  
  
function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    createBoard(user1Grid, user1Squares);
  }
  
/////////////////////////////////////////////////////////////////////////////////////////////////////


init();
function init() {
    updateScore(0);
    updatePlayerTurn();
    createBoard(user1Grid, user1Squares)
    gameActive = true;
    
}

//create board
function createBoard(grid, squares) {
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div')
        square.className = "square"
        square.dataset.id = i;
        square.setAttribute('id', 'sq' + i);
        square.dataset.state = 0;
        square.dataset.type = 0;
        // Math.floor(Math.random() * 2)%2?1:4; //either carrot or radish
        grid.appendChild(square)
        squares.push(square)
    }
}


// var grid = document.getElementsByClassName('square');

Array.from(user1Squares).forEach(v => v.addEventListener('click', function () {
    if (playerTurn == playerNumber) { // clicks only affect if its their turn

        // console.log( typeof Object.assign({}, v.dataset));
        console.log(v.dataset.state)

        var btns = document.querySelectorAll('.action_button');
        var action_type = "";

        [].forEach.call(btns, function(btns) {
            if (btns.dataset.selected == 1) {
                action_type = String(btns.id).substring(0,1);
            } 
        })
        
        if (action_type != "") {
            if (action_type == "p") {
                Array.from(user1Squares).forEach(v => {
                    var sqClass = document.getElementById('sq' + v.dataset.id).className;
                    if (sqClass.includes("highlight") && v.dataset.type == 0 && v.dataset.state == 0) {
                        v.dataset.state = 1;
                        v.dataset.type = playerNumber;

                        if (playerNumber == 1) {
                            v.style.backgroundImage = 'url(assets/' + plants[0][v.dataset.state] + ')';
                        } else if (playerNumber == 2) {
                            v.style.backgroundImage = 'url(assets/' + plants[1][v.dataset.state] + ')';
                        }
                    }
                })
            } else if (action_type == "h") {
                var numHarvest = 0;
                Array.from(user1Squares).forEach(v => {
                    var sqClass = document.getElementById('sq' + v.dataset.id).className;
                    if (sqClass.includes("highlight") && (v.dataset.state > 4 && v.dataset.state <= 8) && v.dataset.type == playerNumber) {
                        numHarvest += 1;
                        v.dataset.state = 0;
                        v.dataset.type = 0;
                        if (playerNumber == 1) {
                            v.style.backgroundImage = 'url(assets/' + plants[0][v.dataset.state] + ')';
                        } else if (playerNumber == 2) {
                            v.style.backgroundImage = 'url(assets/' + plants[1][v.dataset.state] + ')';
                        }
                    }
                })
                updateScore(numHarvest * 10);
            } else if (action_type == "s") {
                Array.from(user1Squares).forEach(v => {
                    var sqClass = document.getElementById('sq' + v.dataset.id).className;
                    if (sqClass.includes("highlight") && v.dataset.state < 9 && v.dataset.type != playerNumber && v.dataset.type != 0) {
                        v.dataset.state = 0;
                        v.dataset.type = 0;
                        if (playerNumber == 1) {
                            v.style.backgroundImage = 'url(assets/' + plants[0][v.dataset.state] + ')';
                        } else if (playerNumber == 2) {
                            v.style.backgroundImage = 'url(assets/' + plants[1][v.dataset.state] + ')';
                        }
                    }
                })
            }

            updatePlayerTurn();
            updateAll();

            // update socket side
            socket.emit('boardUpdate', {"code": code, "gameData": gameData});
        }
    }
}));

// Highlight squares
Array.from(user1Squares).forEach(v => v.addEventListener('mouseover', function () {
    var indicator = parseInt(v.dataset.id);

    var btns = document.querySelectorAll('.action_button');
    var action = "";

    [].forEach.call(btns, function(btns) {
        if (btns.dataset.selected == 1) {
            action = btns.id;
        }
    })

    var idx = plant(indicator,action);

    [].forEach.call(idx, function(idx) {
        var element = document.getElementById('sq' + idx);
        element.classList.add("highlight");
    })

    // console.log(idx.toString());
}));

// Remove highlight squares
Array.from(user1Squares).forEach(v => v.addEventListener('mouseleave', function () {
    var indicator = parseInt(v.dataset.id);

    var btns = document.querySelectorAll('.action_button');
    var action = "";

    [].forEach.call(btns, function(btns) {
        if (btns.dataset.selected == 1) {
            action = btns.id;
        }
    })

    var idx = plant(indicator,action);

    [].forEach.call(idx, function(idx) {
        var element = document.getElementById('sq' + idx);
        element.classList.remove("highlight");
    })
}));

// SELECT ACTION
document.querySelectorAll('.action_button').forEach(b => b.addEventListener('click', function () {
        console.log(b.id);

        var btnID = b.id;
        var btn = document.querySelector('#' + btnID);

        // reset all other buttons
        var btns = document.querySelectorAll('.action_button');
        [].forEach.call(btns, function(btns) {
            btns.dataset.selected = 0;
            btns.style.backgroundColor = "#48CAFD";
        });
        
        btn.dataset.selected = 1;
        btn.style.backgroundColor = '#004AAD';
    })
)

function plant(coordinate, action){
    const points = new Array();

    if(action == "p1"){
        var offset = [[-11,-10,-9],[-1,0,1],[9,10,11]];
        offset.forEach(o => {
            tens = Math.floor((coordinate + o[1]) / 10)
            o.forEach(n => {
                var val = coordinate + n;
                if ((Math.floor(val/10) == tens) && (val >= 0 && val < 100)) {
                    points.push(val);
                }
            })
        })
        return points;
    }
    if(action == "p2"){
        var offset = [-40,-30,-20,-10,0,10,20,30,40];
        offset.forEach(o => {
            var val = coordinate + o;
            if (val >= 0 && val < 100) {
                points.push(val);
            }
        })
        return points;
    }
    if(action == "p3"){
        var offset = [-4,-3,-2,-1,0,1,2,3,4];
        offset.forEach(o => {
            var val = coordinate + o;
            tens = Math.floor(coordinate / 10)
            if (Math.floor(val / 10) == tens) {
                points.push(val);
            }
        })
        return points;
    }
    if(action == "h1"){
        var offset = [[-10, -9], [0, 1]];
        offset.forEach(o => {
            tens = Math.floor((coordinate + o[0]) / 10)
            o.forEach(n => {
                var val = coordinate + n;
                if ((Math.floor(val/10) == tens) && (val >= 0 && val < 100)) {
                    points.push(val);
                }
            })
        })
        return points;
    }
    if(action == "h2"){
        var offset = [0,10,20,30]

        offset.forEach(o => {
            if (coordinate + o < 100) {
                points.push(coordinate + o)
            }
        })
    }
    if(action == "h3"){

        var offset = [0,1,2,3];
        offset.forEach(o => {
            var val = coordinate + o;
            tens = Math.floor(coordinate / 10)
            if (Math.floor(val / 10) == tens) {
                points.push(val);
            }
        })

        return points;
    }
    if(action == "s1"){
        var offsetVert = [-10, 0, 10];
        offsetVert.forEach(o => {
            var val = coordinate + o;
            if (val >= 0 && val < 100) {
                points.push(val)
            }
        })
        var offsetHoriz = [-1, 1];
        var tens = Math.floor((coordinate) / 10)
        offsetHoriz.forEach(o => {
            var val = coordinate + o;
            if (Math.floor(val/10) == tens) {
                points.push(val);
            }
        })
        return points;

    }
    if(action == "s2"){
        points.push(coordinate);

        var offset = [[-11,-9],[9,11]];
        offset.forEach(o => {
            tens = Math.floor((coordinate + (o[1] + o[0])/2) / 10)
            o.forEach(n => {
                var val = coordinate + n;
                if ((Math.floor(val/10) == tens) && (val >= 0 && val < 100)) {
                    points.push(val);
                }
            })
        })
        return points;

    } else {
        points.push(coordinate);
        return points
    }
}

function updateScore(score){
    if(playerNumber == 1) {
        p1Score += score;
    } else {
        p2Score += score;
    }
    p1Score_el.textContent = "Player 1: " + String(p1Score);
    p2Score_el.textContent = "Player 2: " + String(p2Score);
}

function updatePlayerTurn(){
    playerTurn = (playerTurn)?0:1;
    // p1Turn.style.display = (playerTurn)?'block':'none';
    // p2Turn.style.display = (playerTurn)?'none':'block';

    if(playerNumber == 1) {
        p1Turn.textContent = (playerTurn)?'It\'s your turn!':'';
        p2Turn.textContent = (playerTurn)?'':'It\'s Player 2\'s turn!';
    } else {
        p2Turn.textContent = (playerTurn)?'It\'s your turn!':'';
        p1Turn.textContent = (playerTurn)?'':'It\'s Player 1\'s turn!';
    }
    
}


function updateAll(){
    gridData = [];
    Array.from(user1Squares).forEach(v => {   
        gridData.push(Object.values(v.dataset).splice(1));
        if(v.dataset.state!=0 && v.dataset.type != 0){

            if (v.dataset.state == 4) {
                // change to grow
                v.style.backgroundImage = 'url(assets/' + plants[playerNumber - 1][2] + ')';
            }

            if (v.dataset.state == 9) {
                // change to rot
                v.style.backgroundImage = 'url(assets/' + plants[playerNumber - 1][3] + ')';
            }
            
            // increase the age of the plant
            v.dataset.state = parseInt(v.dataset.state) + 1;

            if (v.dataset.state == 11) {
                // remove 
                v.dataset.state = 0;
                v.dataset.type = 0;
                v.style.backgroundImage = 'url(assets/' + plants[playerNumber - 1][0] + ')';
            }
            
        }
    })

    // flush old data out
    scoreData = []
    gameData = []

    // console.log(gridData);
    scoreData.push(p1Score, p2Score);
    gameData.push(scoreData, gridData, playerTurn);

}
