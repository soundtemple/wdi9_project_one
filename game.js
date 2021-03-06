console.log('Lets go!');

// Global variables
var board = [];
var players = ['Player1', 'Player2']
var playerPos = [0,0];
var playerEarnings = [0,0];
var boardRows = 5; // potentiallly not required in new format
var boardCols = 5; //
var currentPlayer = 0;
var diceSize = 6; //default = 6
var complexity = 1; //default 1
var planets = [];
var roll = 0;
var animationTimer;

// Set up board in DOM
function createGrid() {
  for (var r=boardRows; r>0; r--) {
    var rowId = 'divRow' + r; //create if for the div
    var $newDiv = $("<div>").attr('id', rowId).addClass("gridRow"); //create and empty div with iD
    var $divLoc = $('.board'); //locate div container;
    $divLoc.append($newDiv);
    for (var c=0; c<boardCols; c++) {
      var cellId = 'cell' + (boardCols * (r-1) + c);
      var $newCell = $("<div>").attr('id', cellId).addClass("gridCell");
      var $cellLoc = $('.gridRow').eq(boardRows - r);
      $cellLoc.append($newCell);
    }
  }
  updateBoardCSS();
};


// Console for game information
function gameMessaging(msg2Console) {
  if (msg2Console === 'empty') {
    $('#messaging-list').empty();
  } else {
    var newItem = $("<li>").text(msg2Console);       // Create a <li> node
    var list = $('#messaging-list');    // Get the <ul> element to insert a new node
    list.prepend(newItem);  // Insert <li> before the first child of <ul>
  }
}


function updatePlayerInfo() {
  var player1Info = players[0] + '  $' + playerEarnings[0];
  var player2Info = players[1] + '  $' + playerEarnings[1];
  var player1Loc = planets[playerPos[0]];
  var player2Loc = planets[playerPos[1]];
  $('#player-one >h3').text(player1Info);
  $('#player-two >h3').text(player2Info);
  $('.p1-loc-money >h3').text(players[0]);
  $('.p1-loc-money >p').text(player1Loc);
  $('.p2-loc-money >h3').text(players[1]);
  $('.p2-loc-money >p').text(player2Loc);
}


// Dice Roll
function rollDice(){
  var diceBground = ['#FDE74C', '#C3423F']
  $('.dice-cont').css('background-color', diceBground[currentPlayer])
  roll = Math.floor((Math.random() * diceSize)+1);
  $('#dice-btn').text(roll)
  return roll;
};

// update currentPlayer
function nextPlayer() {
  currentPlayer+=1;
  if (currentPlayer>1){
    currentPlayer=0;
  }
  return currentPlayer;
};

//Get other player
function getOtherPlayer(currentPlayer) {
  var otherPlayer = 1;
  if (currentPlayer === 1){
    otherPlayer= 0;
  }
  return otherPlayer;
};

// player move
function playerMove() {
  nextPlayer();
  roll = rollDice();
  playerEarnings[currentPlayer]+= roll;
  if ((playerPos[currentPlayer] + roll) <= getBoardSize()) {
    gameMessaging(players[currentPlayer]  + ' rolls a ' + roll + ' moves to ' + planets[playerPos[currentPlayer] + roll]);
  }
  //set up animation
  var destination = playerPos[currentPlayer] + roll;
  clearInterval(animationTimer);
  activate_timer(destination);
};

//Player move pt2 - check holes/corridors and move again if required.
function playerMoveJump() {
  console.log('player move jump function');
  var adj4holeCorridor = check4HolesCorridors();
  console.log(adj4holeCorridor + "this is the jump");
  // debugger
  if (adj4holeCorridor != 0) {
    var destination = playerPos[currentPlayer] + adj4holeCorridor;
    console.log('BH/TC detected. Destination = ' + destination);
    if (destination < 0) {
      console.log("Less than zero");
      destination = 0;
    }
  updatePlayerInfo();
  activate_timer(destination);
  }
  updatePlayerInfo();
  // return destination
};

function activate_timer(destination) {
  animationTimer = setInterval(function(){
    console.log('normal running', animationTimer);
    animatePlayerMove(destination);
  }, 250);
}

//Animate player move. check winner, check for holes/corridors
function animatePlayerMove(destination) {
  emptyOldPlayerPos();
  console.log(destination + 'dest.');
  console.log(playerPos[currentPlayer] + 'current player pos');
  if (destination > playerPos[currentPlayer]) {
    playerPos[currentPlayer]+=1;
  } else if (destination < playerPos[currentPlayer]) {
    playerPos[currentPlayer]-=1;
  } else if (destination === playerPos[currentPlayer]) {
    console.log('CANCELING TIMER', animationTimer);
    clearInterval(animationTimer);
    checkWinner(currentPlayer);
    console.log('Destination = ' + destination + players[currentPlayer] + ' is at ' + playerPos[currentPlayer]);
    playerMoveJump();
  }
  showPlayerPos();
};


// show player position on board
function showPlayerPos() {
  var p1cell = 'cell' + playerPos[0];
  var p2cell = 'cell' + playerPos[1];
  if (playerPos[0] === playerPos[1]) {
    $('#'+p1cell).prepend('<img id="p1" src="./images/sh12.png" />');
  } else {
    $('#'+p1cell).prepend('<img id="p1" src="./images/sh1.png" />');
    $('#'+p2cell).prepend('<img id="p1" src="./images/sh2.png" />');
  }
}


function emptyOldPlayerPos() {
  var p1cell = 'cell' + playerPos[0];
  var p2cell = 'cell' + playerPos[1];
  $('#'+p1cell).empty();
  $('#'+p2cell).empty();
}

// check if winner
function checkWinner(currentPlayer) {
  winningValue = (board.length-1);
  if (playerPos[currentPlayer] === winningValue) {
    winner(currentPlayer);
  } else if (playerPos[currentPlayer] > winningValue) {
    playerPos[currentPlayer]-= roll;
    gameMessaging(players[currentPlayer] + ' is OVER! Go stay at ' + planets[playerPos[currentPlayer]])
  }
};

// winner
function winner(currentPlayer) {
  updatePlayerInfo();
  showPlayerPos();
  var winnerMessage = '** '+ players[currentPlayer] + ' is the winner!!!!! **';
  $(".end-screen >h3").text('** '+ players[currentPlayer] + ' is the winner!!!!! **')
  gameMessaging(winnerMessage);
  endGame();
};


function check4HolesCorridors() {
  var currentPlayerPos = playerPos[currentPlayer];
  var holeCorridorVal = 0;
  if (board[currentPlayerPos] != 0) {
    holeCorridorVal = board[currentPlayerPos];
    if (holeCorridorVal < 0) {
      gameMessaging('Oh no ' + players[currentPlayer] + ' a black hole!!!!' );
    };
    if (holeCorridorVal > 0) {
      gameMessaging('Yes ' + players[currentPlayer] + ' a Time Corridor!!!!!');
    };
  }
  return holeCorridorVal;
};

// reset game parameters
function resetGame() {
  playerPos = [0,0];
  $('.board').hide();
  $('.end-screen').hide();
  $('.splash-screen').show();
  $('.player-info').hide();
  $('.footer').hide();
};

function startGame() {
  diceSize = $('.set-dicesize').val(); //default = 6
  complexity = $('.set-complexity').val(); //default 1
  playerPos = [0,0];
  board = [];
  $('.board').empty();
  createBoard();
  $('.end-screen').hide();
  $('.splash-screen').hide();
  $('.board').show();
  $('.player-info').show();
  gameMessaging('empty')
  $('.footer').show();
  $('#dice-btn').text('ROLL')
  checkPlayerNames();
  updatePlayerInfo();
  showPlayerPos();
};

function endGame() {
  $('.gridCell').removeClass('cell-black-hole');
  $('.gridCell').removeClass('cell-time-corridor');
  $('.end-screen').show();
  $('.board').hide();

}


// creates board based on inputs for board size x rows and y columns
function createBoard(){
  var boardSize = getBoardSize();
  for (var i=0; i<boardSize; i++) {
    board.push(0);
  }
  calcJumps();
  console.log(board);
  createGrid();
  addBoardHolsCorrs();
  createPlanetNames();
  return board
};

// create arrays for BH & TC position & values
function calcJumps() {
  var jumps = calcJumpNums();
  var jumpPositions = createJumpPos(jumps.numBlackHoles + jumps.numTimeCorridors);
  var numBlackHoles = jumps.numBlackHoles;
  var numTimeCorridors = jumps.numTimeCorridors;
  var totalJumps = jumps.numBlackHoles + jumps.numTimeCorridors
  var jumpAmts = createJumpAmts(jumpPositions, numBlackHoles)
  // add jumps to the board
  for (var i=0; i<totalJumps; i++) {
      // console.log(jumpPositions[i] + ' amt = ' + jumpAmts[i] );
      board[jumpPositions[i]] = jumpAmts[i];
    }
  // console.log('total jumps = ' + totalJumps);
  // console.log('Number of black Holes = ' + numBlackHoles);
  // console.log('Number of Time corridors = ' + numTimeCorridors);
  // console.log('Jump Positions located at = ' + jumpPositions);
  // console.log('Jump Amounts are = ' + jumpAmts);
};

function checkPlayerNames() {
  var p1 = $('.player1-name').val();
  var p2 = $('.player2-name').val();
  if (p1 != '') {
    players[0] = p1;
  };
  if (p2 != '') {
    players[1] = p2;
  };
}

// create number of BlackHoles and time corridors for board
function calcJumpNums() {
  var boardSize = board.length;
  var numBlackHoles = parseInt(boardSize * complexity * (7/100));
  var numTimeCorridors = parseInt(boardSize / complexity * (8/100));
  return {
    numBlackHoles : numBlackHoles,
    numTimeCorridors : numTimeCorridors
  };
};


// Create Jump Positions
function createJumpPos(number2Create) {
  var jumpPos = [];
  var boardSize = board.length;
  for (var i=0; i<number2Create; i++) {
    var position = Math.floor((Math.random() * boardSize * 0.85) + 1);
    jumpPos[i] = position;
  }
  // console.log(jumpPos);
  return jumpPos;
};

// Create jump values
function createJumpAmts(jumpPos, numBlackHoles) {
  var jumpAmts = [];
  var boardSize = board.length;
  for (var i=0; i<jumpPos.length; i++) {
    var rndmAmt = Math.floor((Math.random() * boardSize * .15) + 5);
    if (i < numBlackHoles) {
      rndmAmt *= -1;
    }
      jumpAmts[i] = rndmAmt
  }
  return jumpAmts;
};


// Get boardSize
function getBoardSize() {
  var boardLength = $('.set-boardsize').val()
  boardRows = Math.sqrt(boardLength);
  boardCols = Math.sqrt(boardLength);
  return boardLength;
};

function updateBoardCSS() {
  var gridHeight = 500 / boardRows;
  var gridWidth = 100/ boardCols;
  var home_planet = "#cell"+(getBoardSize() - 1);
  console.log(home_planet);
  $(".gridRow").css("height", gridHeight)
  $(".gridCell").css("height", gridHeight)
  $(".gridCell").css("width", gridWidth + '%')
  $("#cell0").addClass("start_planet")
  $(home_planet).addClass("home_planet")
}

// Create Planet names
function createPlanetNames() {
  var prefix = ["Sn", "Sw", "Sl", "Sp", "Wh", "Fl", "Dr", "Fr", "Sh", "Ch", "Pl", "Gr", "Th", "Tr", "Pr", "Wh", "Bl", "Br", "B", "C", "D", "F", "G", "H", "J", "K", "M", "N", "P", "R", "S", "T", "V", "W", "Z", "Kl", "Cr", "Dr", "Kl", "Kr"];
  var vowel = ["ae", "iy", "au", "up", "ea", "ei", "ue", "eo", "ia", "iu", "a", "e", "i", "o", "u"];
  var suffix = ["drealea", "miocury", "frarth", "kypso", "tune", "mia", "snope", "buyama", "ichi", "", "kothea", "skuna", "grorth", "carro", "shan", "wuovis", "gryke", "clillon", "tov", "iaruta", "cania", "facury", "pluarus", "slaowei", "plippe", "vacliuq", "maruta", "pogawa", "bliri", "frora"];
  var postCode = ["ZMB", "WP6", "", "Major", "Minor", "EW8", "8S5P", "A5", "S774", "X700", "Z7D3", "N49M", "66Q", "Z", "Q", "W9", "RB", "TD", "PQ", "SDA", "DX", "F", "GQ", "R808", "J106", "DR909"]
  var numPlanets = board.length
  for ( var i=0; i<numPlanets - 1; i++) {
    pPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    pVowel = vowel[Math.floor(Math.random() * vowel.length)];
    pSuffix = suffix[Math.floor(Math.random() * suffix.length)];
    var addPostCode = Math.random();
    if (addPostCode > 0.7) {
      pPostCode =postCode[Math.floor(Math.random() * postCode.length)];
    } else {
      pPostCode = '';
    }
    planets[i] = pPrefix + pVowel + pSuffix + ' ' + pPostCode;
  }
  planets[numPlanets-1] = 'Bellerophon (home!)';
  console.log(planets);
  return planets;
}


// Change grid cell ID's to update bground as a black hole or time corridor
function addBoardHolsCorrs() {
  for (var i=0; i<board.length; i++) {
    var cell2change = 'cell' + i;
    if (board[i] > 0 ) {
      $('#'+cell2change).addClass('cell-time-corridor');
    } else if (board[i] < 0) {
      $('#'+cell2change).addClass('cell-black-hole');
      }

    }
  }




//ON START...
$('.player-info').hide();
$('.footer').hide();




//EVENT LISTENER
$('#dice-btn').on("click", playerMove);
$('.p1-loc-money').on("click", playerMove); // player1 move
$('.p2-loc-money').on("click", playerMove); // player2 move
$('#start-game').on("click", startGame);
$('#play-again').on("click", resetGame);
$(document).on('click', '.gridCell' , function(e) {
  if ($(event.target).hasClass('gridCell'))  {
    var planetId = $(event.target).attr('id').replace(/[a-zA-Z]/g, '');
  } else {
    var planetId = $(event.target).parent().attr('id').replace(/[a-zA-Z]/g, '');
  }
  var addInfo = '';
  var newPlanet = 0;
  var planetType = board[planetId];  // get +value for TC & -value for BHole
  if ( planetType > 0 ) {
    newPlanet = planets[Number(planetId) + Number(planetType)];
    addInfo = '. It has a time corridor, taking you forward to ' + newPlanet;
    if (newPlanet > board.length) {
      addInfo = '';
      newPlanet = 0;
    }
  };
  if ( planetType < 0 ) {
    if (Number(planetId) + Number(planetType) < 0) {
      newPlanet = planets[0];
    } else {
      newPlanet = planets[Number(planetId) + Number(planetType)];
    }
    addInfo = '. It is a black hole, taking you back to ' + newPlanet;
    if (newPlanet > 0) {
      addInfo = '';
      newPlanet = 0;
    }
  }
  gameMessaging('This is ' + planets[planetId] + addInfo);
});
