//initail data
let inputBuffer = {}

let canvas = null
let ctx = null
let COORD_SIZE = 0
let CELL_SIZE = 0
let sizeOfMaze = 5
let exitIndex = sizeOfMaze - 1

let lastTimestamp = performance.now();



let showBreadCrumbs = false
let showShortestPath = false
let showHint = false




let maze = []
let shortestPath = []
let highScores = []
let myCharacter = null
let mazeExit = null
let breadCrumbs = null
let shortestPathIcons = null
let lastLocation
let score = 0
let gameFinished = false

let background = new Image()
background.isReady = false
background.onload = function () {
    this.isReady = true
}
background.src = './Static/pixelBackground.jpg'

function changeSize(newSize) {
    sizeOfMaze = newSize
    maze = []
    shortestPath = []
    canvas = null
    ctx = null
    mazeExit = null
    breadCrumbs = null
    shortestPathIcons = null
    gameFinished = false
    exitIndex = sizeOfMaze - 1
    score = 0
    var div = document.getElementById("finished-game");
    if(div && div.parentNode){
        div.parentNode.removeChild(div);
    }
    initialize()
}

function initializeImage(imageSource, locaton) {
    let image = new Image()
    image.isReady = false
    image.onload = function () {
        this.isReady = true
    }
    image.src=imageSource
    return {
        location: locaton,
        image: image
    }
}

function renderImage(object) {
    if(object.image.isReady) {
        centerX = object.location.x * CELL_SIZE + CELL_SIZE / 2
        centerY = object.location.y * CELL_SIZE + CELL_SIZE / 2


        ctx.drawImage(
            object.image,
            centerX - CELL_SIZE / 2,
            centerY - CELL_SIZE / 2,
            CELL_SIZE,
            CELL_SIZE
        );
    }
}

function drawIcons(breadImage, x ,y) {
        centerX = x * CELL_SIZE + CELL_SIZE / 2
        centerY = y * CELL_SIZE + CELL_SIZE / 2



        ctx.drawImage(
            breadImage.image,
            //I want the icons to be smaller then the other images so I divide by 3.5 instead of 2
            centerX - CELL_SIZE / 3.5,
            centerY - CELL_SIZE / 3.5,
            CELL_SIZE/2,
            CELL_SIZE/2
        );
}


function moveCharacter(key, character) {
    // first tell the cell that the character visited here
    let lengthOfShortestPath = shortestPath.length-1
    maze[character.location.y][character.location.x].breadCrumbs = true
    lastLocation=character.location


    

    if (key === "ArrowDown" || key === 's') {
        if (character.location.edges.s) {
            character.location = character.location.edges.s
        }
    }
    if (key === "ArrowUp" || key === 'w') {
        if (character.location.edges.n) {
            character.location = character.location.edges.n
        }
    }
    if (key === "ArrowRight" || key === 'd') {
        if (character.location.edges.e) {
            character.location = character.location.edges.e
        }
    }
    if (key === "ArrowLeft" || key === 'a') {
        if (character.location.edges.w) {
            character.location = character.location.edges.w
        }
    }
    
    //update score based on movement
    score = score + character.location.score

    // set the location score to 0 since we already have gotten the points for this cell
    character.location.score=0

    //check to see if the user made it to the end of the maze
    if(character.location.x === exitIndex && character.location.y === exitIndex ) {
        finishGame()
    }
    else {
        //update the shortestpath stack
        if(character.location.x === shortestPath[lengthOfShortestPath].x && character.location.y === shortestPath[lengthOfShortestPath].y ) {
            shortestPath.pop()
        }
        else{
            shortestPath.push(lastLocation)
        }
    }
}

function checkScore() {

    // Add the score if there are fewer than 5 high scores
    if (highScores.length < 5) {
        highScores.push(score);
    } else {
        // Insert the new score at the appropriate position
        let inserted = false;
        for (let i = 0; i < highScores.length; i++) {
            if (score > highScores[i]) {
                highScores.splice(i, 0, score);
                inserted = true;
                break;
            }
        }


        // Remove the last score to maintain only the top 5, then sort the array in descending order
        highScores.splice(5, 1);
        highScores.sort((a, b) => b - a);
    }
    highScores.sort((a, b) => b - a);

}

function finishGame () {
    gameFinished = true
    score = score - 5
    checkScore()
    // Get the container element where the high scores will be displayed
    let container = document.getElementById("highScores");

    // Clear any existing content in the container
    container.innerHTML = "";

    // Create and append HTML elements for each high score
    let highscoreElement = document.createElement("div")
    highscoreElement.textContent = "TOP 5 HIGHSCORES"
    highscoreElement.style.marginBottom = "10px"
    container.appendChild(highscoreElement)

    highScores.forEach((score, index) => {
        let scoreElement = document.createElement("div");
        scoreElement.textContent = "highscore #" + (index + 1) + ": " + score;
        scoreElement.style.marginBottom = "10px"
        container.appendChild(scoreElement);
    });
}

function initializeMaze() {
    let frontier = []
    for (let row = 0; row < sizeOfMaze; row++){
        maze.push([])
        for (let col = 0; col < sizeOfMaze; col++) {
            maze[row].push({
                x: col, y: row, visited: false, breadCrumbs: false, score: -2, edges: {
                    // if a cells edge is null there is a wall
                    // if it is not null there is a reference to the next cell
                    n: null,
                    s: null,
                    w: null,
                    e: null
                }
            })
        }
    }
    frontier.push(maze[0][0]) //initial frontier

   while (frontier.length > 0) {
        let randomNum = Math.floor(Math.random() * frontier.length)
        let currentCell = frontier[randomNum]
        frontier = frontier.filter(cell => cell !== currentCell)
        let wallsToSelect = []
        maze[currentCell.y][currentCell.x].visited = true
        
        
        if (currentCell.x > 0 && maze[currentCell.y][currentCell.x - 1].visited) {
            wallsToSelect.push([maze[currentCell.y][currentCell.x - 1], 'w'])
        }
        // Right neighbor
        if (currentCell.x < sizeOfMaze - 1 && maze[currentCell.y][currentCell.x + 1].visited) {
            wallsToSelect.push([maze[currentCell.y][currentCell.x + 1], 'e'])
        }
        // Upper neighbor
        if (currentCell.y > 0 && maze[currentCell.y - 1][currentCell.x].visited) {
            wallsToSelect.push([maze[currentCell.y - 1][currentCell.x], 'n'])
        }
        // Lower neighbor
        if (currentCell.y < sizeOfMaze - 1 && maze[currentCell.y + 1][currentCell.x].visited) {
            wallsToSelect.push([maze[currentCell.y + 1][currentCell.x], 's'])
        }
        if (wallsToSelect.length > 0) {
            randomNum = Math.floor(Math.random() * wallsToSelect.length)
            let direction = wallsToSelect[randomNum][1]
            let coords = wallsToSelect[randomNum][0]
            currentCell.edges[direction] = coords
            coords.edges[getOppositeDirection(direction)] = currentCell
        }
       


        //get neighbors

        // check the left neighbor for being in the maze and in maze bounderies
        if (currentCell.x > 0 && !maze[currentCell.y][currentCell.x - 1].visited) {
            frontier.push(maze[currentCell.y][currentCell.x - 1])
        }

        //check the right neighbor for being in the maze and in maze bounderies
        if (currentCell.x < sizeOfMaze - 1 && !maze[currentCell.y][currentCell.x + 1].visited) {
            frontier.push(maze[currentCell.y][currentCell.x + 1])
        }

        //check the uper neighbor for being in the maze and in maze bounderies
        if (currentCell.y > 0 && !maze[currentCell.y - 1][currentCell.x].visited) {
            frontier.push(maze[currentCell.y - 1][currentCell.x])
        }

        //check the lower neighbor for being in the maze and in maze bounderies
        if (currentCell.y < sizeOfMaze - 1 && !maze[currentCell.y + 1][currentCell.x].visited) {
            frontier.push(maze[currentCell.y + 1][currentCell.x])
        }
        
   }
}

function initializeCellScoring(cell) {

    maze[cell.y][cell.x].score = 5

    //set all adjecent cells score to -1 as long as they arent in the shortest path
    if( cell.x > 0 && maze[cell.y][cell.x-1].score !== 5){
        maze[cell.y][cell.x-1].score = -1
    }
    if(cell.x < sizeOfMaze - 1 && maze[cell.y][cell.x+1].score !== 5){
        maze[cell.y][cell.x+1].score = -1
    }
    if( cell.y < sizeOfMaze - 1 && maze[cell.y+1][cell.x].score !== 5){
        maze[cell.y+1][cell.x].score = -1
    }
    if(cell.y > 0 && maze[cell.y-1][cell.x].score !== 5){
        maze[cell.y-1][cell.x].score = -1
    }
   
}

function calculateShortestPath() {
    let queue = [];
    let visited = [];
    let parents = [];
    shortestPath = [];

    // Initialize visited and parents arrays
    for (let i = 0; i < sizeOfMaze; i++) {
        visited.push(new Array(sizeOfMaze).fill(false));
        parents.push(new Array(sizeOfMaze).fill(null));
    }

    // Perform BFS
    queue.push(maze[0][0]);
    visited[0][0] = true;

    while (queue.length > 0) {
        let currentCell = queue.shift();
        let { x, y } = currentCell;

        if (x === exitIndex && y === exitIndex) {
            // Backtrack to construct shortest path
            let current = maze[exitIndex][exitIndex];
            while (current !== maze[0][0]) {
                shortestPath.push(current);
                initializeCellScoring(current)
                current = parents[current.y][current.x];
            }
            break;
        }

        // Explore neighbors
        let neighbors = [
            { dx: 0, dy: -1, direction: 'n' }, // Up
            { dx: 0, dy: 1, direction: 's' },  // Down
            { dx: -1, dy: 0, direction: 'w' }, // Left
            { dx: 1, dy: 0, direction: 'e' }   // Right
        ];

        for (let neighbor of neighbors) {
            let nx = x + neighbor.dx;
            let ny = y + neighbor.dy;
            

            if (nx >= 0 && nx < sizeOfMaze && ny >= 0 && ny < sizeOfMaze && !visited[ny][nx] && maze[y][x].edges[neighbor.direction]) {
                visited[ny][nx] = true;
                parents[ny][nx] = currentCell;
                queue.push(maze[ny][nx]);
            }
        }


    }
}


function getOppositeDirection(direction) {
    switch (direction) {
        case 'n':
            return 's'
        case 's':
            return 'n'
        case 'w':
            return 'e'
        case 'e':
            return 'w'
    }
}



function drawCell(cell) {
    if (cell.breadCrumbs === true && showBreadCrumbs) {
        drawIcons(breadCrumbs, cell.x, cell.y)
    }

    if (cell.edges.n === null) {
        ctx.moveTo(cell.x * CELL_SIZE, cell.y * CELL_SIZE)
        ctx.lineTo((cell.x+1)*CELL_SIZE, cell.y * CELL_SIZE)
    }

    if (cell.edges.s === null) {
        ctx.moveTo(cell.x * CELL_SIZE, (cell.y + 1) * CELL_SIZE)
        ctx.lineTo((cell.x +1 )*CELL_SIZE, (cell.y + 1) * CELL_SIZE)
    }

    if (cell.edges.e === null) {
        ctx.moveTo((cell.x +1 ) * CELL_SIZE, cell.y * CELL_SIZE)
        ctx.lineTo((cell.x+1) * CELL_SIZE, (cell.y + 1) * CELL_SIZE)
    }

    if (cell.edges.w === null) {
        ctx.moveTo(cell.x * CELL_SIZE, cell.y * CELL_SIZE)
        ctx.lineTo(cell.x *CELL_SIZE, (cell.y + 1) * CELL_SIZE)
    }
}

function renderShortestPath(){
    let lengthOfShortestPath = shortestPath.length-1
    if(myCharacter.location.x === shortestPath[lengthOfShortestPath].x && myCharacter.location.y === shortestPath[lengthOfShortestPath].y ) {
        shortestPath.pop()
    }
    if(showHint) {
        drawIcons(shortestPathIcons, shortestPath[lengthOfShortestPath].x, shortestPath[lengthOfShortestPath].y)
    }
    if(showShortestPath){
        for (let row = 0; row < sizeOfMaze; row++) {
            for (let col = 0; col < sizeOfMaze; col++) {
                for(let x = 0; x < shortestPath.length; x++){
                if(maze[col][row] === shortestPath[x]) {
                    drawIcons(shortestPathIcons, row, col)
                }
                }
            }
        }
    }
}

function toggleBreadCrumbs(){
    showBreadCrumbs = !showBreadCrumbs
}

function toggleShortestPath() {
    showShortestPath = !showShortestPath
}

function toggleHint () {
    showHint = !showHint
}

function renderMaze() {
    ctx.beginPath()
    for (let row = 0; row < sizeOfMaze; row++) {
        for (let col = 0; col < sizeOfMaze; col++) {
            drawCell(maze[row][col])
        }
    }
    ctx.strokeStyle = 'rgb(0, 0, 0)'
    ctx.lineWidth = 6
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(COORD_SIZE - 1, 0)
    ctx.lineTo(COORD_SIZE - 1, COORD_SIZE - 1)
    ctx.lineTo(0, COORD_SIZE - 1)
    ctx.closePath()
    ctx.strokeStyle = 'rgb(0, 0, 0)'
    ctx.lineWidth = 6
    ctx.stroke()
}

function renderDom(elapsedTime) {
    document.getElementById("displayScore").innerText = "Your current score: " + score
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    document.getElementById("timer").innerText = `Time: ${minutes}:${seconds}`
}

function render(elapsedTime) {

    if(!gameFinished){
        ctx.clearRect(0,0,canvas.width, canvas.height)

        renderMaze()
        renderImage(myCharacter)
        renderShortestPath()
        renderImage(mazeExit)
        renderDom(elapsedTime)
    }
    else {
        ctx.clearRect(0,0,canvas.width, canvas.height)
        renderMaze()
        renderImage(mazeExit)
    }
}



function processInput() {
    if(!gameFinished) {
    for (input in inputBuffer) {
        // move functions
        if (inputBuffer[input] === "ArrowDown" || inputBuffer[input] === "ArrowUp" || inputBuffer[input] === "ArrowRight" || inputBuffer[input] === "ArrowLeft" || inputBuffer[input] === "s" || inputBuffer[input] === "w" || inputBuffer[input] === "a" || inputBuffer[input] === "d") {
            moveCharacter(inputBuffer[input], myCharacter)
        } 

        else if (inputBuffer[input] === "b") {
            toggleBreadCrumbs() 
        }
        else if (inputBuffer[input] === 'p') {
            toggleShortestPath()
        }
        else if (inputBuffer[input] === 'h') {
            toggleHint()
        }

    }
    }
    inputBuffer = {}
}

function update(elapsedTime) {

}

function gameLoop(timestamp) {
    let elapsedTime = timestamp - lastTimestamp;
    processInput()
    update(elapsedTime)
    render(elapsedTime)

    requestAnimationFrame(gameLoop)
}



function initialize() {
    canvas = document.getElementById('mazeCanvas');
    ctx = canvas.getContext('2d');

    COORD_SIZE=canvas.width
    CELL_SIZE = COORD_SIZE / sizeOfMaze 


    initializeMaze()
    myCharacter = initializeImage('./Static/pixelDude.png', maze[0][0])
    mazeExit = initializeImage('./Static/pixelHouse.png', maze[exitIndex][exitIndex])
    breadCrumbs = initializeImage('./Static/pixelFlower.png', maze[0][0])
    shortestPathIcons = initializeImage('./Static/Cookie.png', maze[0][0])
    calculateShortestPath()


    window.addEventListener('keydown', function (event) {
        inputBuffer[event.key] = event.key
    })
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop)
}