const row = 10
const col = 10
const squareSize = 50;
const shipName = ["Aircraft Carrier", "Battleship", "Submarine"];

var gameboardContainer = document.querySelector(".gameboards");
var opp_gameboard = document.querySelector("#opp-board");
var curr_gameboard = document.querySelector("#curr-board");
var scorebox = document.querySelector("#scorebox");
var scoreboard = document.querySelector("#scoreboard");

var p1Name;         // each player's name
var p2Name;
var p1Board;   // keeps track of ship placement
var p2Board;
var p1Score = 24;    // each player's score
var p2Score = 2;

var curPlayer = 1;
var oppPlayer = 2;

var allScores = {};
const isStorage = 'undefined' !== typeof localStorage;
if (isStorage && localStorage.getItem('ten-scores')) {
    allScores = JSON.parse(localStorage.getItem('ten-scores'));
}; 

var ships = {       // keep track if ship is sunk
    1: { A: 5, B: 4, S: 3 },
    2: { A: 5, B: 4, S: 3 },
};


function waitAlert(message) {
    setTimeout(function () { alert(message); }, 500);
}

function initialize(player) {
    var name;
    var board = {};

    // prompt user's name
    while (!name) {
        name = prompt(`Player${player}\'s Name:`, "Your name");
        if (!name) {
            alert("Please enter a valid name!");
        }
    }

    // prompt for ship placements
    var re = /(^([ABS]:[A-J]([1-9]|10)-[A-J]([1-9]|10);\s*){2}[ABS]:[A-J]([1-9]|10)-[A-J]([1-9]|10);{0,1}$|^([ABS]\([A-J]([1-9]|10)-[A-J]([1-9]|10)\);\s*){2}[ABS]\([A-J]([1-9]|10)-[A-J]([1-9]|10)\);{0,1}$)/;

    while (true) {
        // check inputs
        placement = prompt(`${name}, where would you like to place your ships?\n
            ex) A:A1-A5;B:B6-E6; S:H3-J3\n
            ex) A(A1-A5); B(B6-E6); S(H3-J3);\n
            ex) B(B6-E6);S(H3-J3);A(A1-A5)`,
            "A:A1-A5;B:B6-E6; S:H3-J3");

        if (placement.match(re)) {  // check regex
            // check if placement count is correct e.g. battleship occupies 4 spaces
            let count = { A: 0, B: 0, S: 0 };

            var shipsPlacement = placement.split(";");
            for (var j = 0; j < 3; j++) {
                // extract information such as which ship, start & end placement
                var place = shipsPlacement[j].trim();
                var whichShip = place.substring(0, 1);
                var startSquare = place.substring(2, 4);
                var endSquare = place.substring(5);

                // update board
                // loop over rows
                if (startSquare.substring(0, 1) == endSquare.substring(0, 1)) {
                    start = Number(startSquare.substring(1, 2));
                    end = Number(endSquare.substring(1));
                    selectCol = startSquare.substring(0, 1);
                    for (var i = start; i <= end; i++) {
                        count[whichShip] += 1;
                        board[selectCol + i] = whichShip;    // 1 indicates a ship
                    }

                // loop over cols
                } else {
                    start = startSquare.substring(0, 1).charCodeAt(0);
                    end = endSquare.substring(0).charCodeAt(0);
                    selectRow = startSquare.substring(1, 2);
                    for (var i = start; i <= end; i++) {
                        count[whichShip] += 1;
                        board[String.fromCharCode(i) + selectRow] = whichShip;    // 1 indicates a ship
                    }
                }
            }

            if (count["A"] == 5 && count["B"] == 4 && count["S"] == 3) {
                placementStr = placement;
                break;
            }
        }
        board = {};
        alert("Please enter valid placements");
    }

    // initialize board
    return [name, board];
}

function draw(gameboard, whichBoard) {
    for (i = 0; i < col; i++) {
        for (j = 0; j < row; j++) {
            var square = document.createElement("div");
            gameboard.appendChild(square);

            // each square has id "A1" to "J10"
            square.id = whichBoard + String.fromCharCode(65 + i) + (j+1);

            square.style.top = j * squareSize + 'px';
            square.style.left = i * squareSize + 'px';
        }
    }
}

function showShipsOnBoard() {
    var board = window["p" + curPlayer + "Board"];
    for (var id in board) {
        if (board.hasOwnProperty(id)) {
            var whichship = board[id];
            if (whichship != 0 && whichship != 1) {
                $("#" + 2 + id).html("<label>" + whichship + "</label>");
            }
        }
    }
}

function showHitMissOnBoard() {
    var curPlayerBoard = window["p" + curPlayer + "Board"];
    var oppPlayerBoard = window["p" + oppPlayer + "Board"];

    for (var id in curPlayerBoard) {
        if (curPlayerBoard.hasOwnProperty(id)) {
            var whichship = curPlayerBoard[id];
            if (whichship == 1) {
                $("#" + 2 + id).css("background-color", "#EC7063");
            } else if (whichship == 0) {
                $("#" + 2 + id).css("background-color", "white");
            }
        }
    }

    for (var id in oppPlayerBoard) {
        if (oppPlayerBoard.hasOwnProperty(id)) {
            var whichship = oppPlayerBoard[id];
            if (whichship == 1) {
                $("#" + 1 + id).css("background-color", "#EC7063");
            } else if (whichship == 0) {
                $("#" + 1 + id).css("background-color", "white");
            }
        }
    }
}

function clearBoards() {
    gameboardContainer.style.display = "none";
    var curPlayerBoard = window["p" + curPlayer + "Board"];
    var oppPlayerBoard = window["p" + oppPlayer + "Board"];

    for (var id in curPlayerBoard) {
        if (curPlayerBoard.hasOwnProperty(id)) {
            $("#" + 2 + id).html("");
            $("#" + 2 + id).css("background-color", "#DEF3F5");
        }
    }
    for (var id in oppPlayerBoard) {
        if (oppPlayerBoard.hasOwnProperty(id)) {
            $("#" + 1 + id).html("");
            $("#" + 1 + id).css("background-color", "#DEF3F5");
        }
    }
}

function fire(e) {
    var target = e.target.id.substring(1);
    var target = e.target.id.substring(1);
    var oppBoard = window["p" + oppPlayer + "Board"];

    // hit, or has been hit, or has been missed
    if (target in oppBoard) {
        var whatShip = oppBoard[target];
        if (whatShip != 0 && whatShip != 1) {   // it's a hit
            $("#" + 1 + target).css("background-color", "#EC7063");
            oppBoard[target] = 1;      // 1 represents a hit
            waitAlert("Hit!");

            // update score board
            window["p" + oppPlayer + "Score"] -= 2;
            ships[oppPlayer][whatShip] -= 1;

            // check if a ship has been sunk
            if (ships[oppPlayer][whatShip] == 0) {
                if (whatShip == "A") {
                    whatShip = shipName[0];
                } else if (whatShip == "B") {
                    whatShip = shipName[1];
                } else {
                    whatShip = shipName[2];
                }
                waitAlert(`${whatShip} has been sunk!`);
            }
        }
    // it's a miss
    } else {
        $("#" + 1 + target).css("background-color", "white");
        oppBoard[target] = 0;      // 0 represents a miss
        waitAlert("Miss!");
    }

    if (checkForWinner()) {
        return;
    };

    setTimeout(function () {
        clearBoards();
        var name = window["p" + oppPlayer + "Name"];
        waitAlert(`Click OK to begin ${name}\'s turn`);
    }, 700);


    setTimeout(function () {
        gameboardContainer.style.display = "flex";
        [curPlayer, oppPlayer] = [oppPlayer, curPlayer];
        showShipsOnBoard();
        showHitMissOnBoard();
    }, 4000);

    e.stopPropagation()
}

//function turn(name, myBoard, oppBoard, myGameboard, oppGameboard, reverse) {
//    console.log(name);
//    console.log(myGameboard);
//    clearBoards();
//    gameboardContainer.style.display = "none";
//    sendAlert(`Click OK to begin ${name}\'s turn`);
//    gameboardContainer.style.flexDirection = reverse;
//    gameboardContainer.style.display = "flex";

//    setTimeout(function () {
//        drawMyBoard(myBoard);
//        drawOpponentBoard(myBoard);
//        drawOpponentBoard(oppBoard);
//    }, 1)

//    myGameboard.removeEventListener("click", fire);
//    oppGameboard.addEventListener("click", (e) => {
//        fire(e);
//        checkForWinner();
//        if (p1turn) {
//            p1turn = !p1turn;
//            turn(p1Name, p1Board, p2Board, p1_gameboard, p2_gameboard, 'column-reverse');
//        } else {
//            p1turn = !p1turn;
//            turn(p2Name, p2Board, p1Board, p2_gameboard, p1_gameboard, "column");
//        }
//    });

//}

function openScores() {
    // sort first
    var sorted = [];
    for (var key in allScores) {
        if (allScores.hasOwnProperty(key)) {
            sorted.push([key, allScores[key]]);
        }
    }
    sorted.sort(function (a, b) { return b[1] - a[1] });

    let htmlTemplate = "";
    for (let i = 0; i < sorted.length; i++) {
        htmlTemplate += `<li style = "margin-bottom:10px;">${sorted[i][0]}\t${sorted[i][1]}</li>`;
    }
    //for (var key in allScores) {
    //    if (allScores.hasOwnProperty(key)) {
    //        htmlTemplate += `<li style = "margin-bottom:10px;">${key}\t${allScores[key]}</li>`;
    //    }
    //}
    scoreboard.innerHTML = htmlTemplate;
    scorebox.style.display = "flex";
}

function checkForWinner() {
    var winner;
    if (p2Score == 0) {  // player 1 wins
        winner = 1;
    } else if (p1Score == 0) {    // player 2 wins
        winner = 2;
    } else {
        return false;     // no winner yet
    }

    var name = window["p" + winner + "Name"];
    var score = window["p" + winner + "Score"];

    waitAlert(`${name} wins! \nScore: ${score}`);

    opp_gameboard.removeEventListener("click", fire);
    curr_gameboard.removeEventListener("click", fire);

    gameboardContainer.style.display = "none";

    // display Top 10 scores
    if (Object.keys(allScores).length == 10) { // 10 scores all filled
        let minName = ""
        let minScore = 25;
        for (var key in allScores) {
            if (allScores.hasOwnProperty(key)) {
                let compScore = allScores[key];

                // winner's score is higher than one of the scoreboard's scores
                if (compScore < score) {    
                    if (compScore < minScore) {
                        minScore = compScore;   // keep track of the minimum score
                        minName = key;
                    }
                }
            }
        }
        // winner's score is higher, delete min score & add new score
        if (minScore != 25) {   
            delete allScores[minName];
            allScores[name] = score;
        }

    } else {    // less than 10 scores
        allScores[name] = score;    // add to scoreboard
    }

    localStorage.setItem("ten-scores", JSON.stringify(allScores));  // update localStorage
    openScores();   // display scoreboard
    return true;
}

function main() {

    // prompt for name & ship placement for each player
    [p1Name, p1Board] = initialize(1);
    [p2Name, p2Board] = initialize(2);

    // draw the gameboard
    draw(opp_gameboard, 1);
    draw(curr_gameboard, 2);


    // game starts

    // Player 1's turn first
    gameboardContainer.style.display = "none";
    alert(`Click OK to begin ${p1Name}\'s turn`);
    gameboardContainer.style.display = "flex";
    showShipsOnBoard();

    // clicks trigger an event
    opp_gameboard.addEventListener("click", fire);


}

main();