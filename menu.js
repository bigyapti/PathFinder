
//getting html element
let form = document.querySelector("#settings");
let size = document.querySelector("#size");
let rowsCols = document.querySelector("#rowscols");
let complete = document.querySelector(".complete");
let reload = document.querySelector(".reload");
let solveBtn = document.querySelector("#solve");

complete.style.display="none";//do not display complete div
reload.style.display ="none";//do not display reload class element 
reload.style.display="none";
solveBtn.style.display="none";

let newMaze; //object of maze class
let path = [];

form.addEventListener("submit",mazeGen);//calls mazegen on submit
solveBtn.addEventListener("click", solveMaze);


reload.addEventListener("click", () => {
    location.reload();//refreshes page 
  }); // reloads on clicking replay

function mazeGen(event){

    event.preventDefault();

    if(size.value < 300 || size.value > 800){
        alert("Please enter size between 400 and 800");
    }

    else if(rowsCols.value < 10 || rowsCols.value > 60){
        alert("Please enter number of rows/columns between 20 and 60");
    }

    else if (rowsCols.value == "" || size.value == ""){
        return alert("Please enter all fields");
    }

    else{

    form.style.display = "none";
    newMaze = new maze(size.value, rowsCols.value , rowsCols.value); //creating maze object
    //sets and displays maze
    newMaze.set();
    newMaze.draw();
    //displays replay
    reload.style.display="block";
    solveBtn.style.display="block";

    }
}

function solveMaze() {
    let start = newMaze.grid[0][0];
    let end = newMaze.grid[newMaze.rows-1][newMaze.columns-1];
    path = AStar(start, end);
    highlightPath(newMaze.rows, newMaze.columns, path);

}

// The A* algorithm implementation
function AStar(start, end) {
  // Initialize the open set with the start node
  let openSet = [start];

  // Initialize the closed set
  let closedSet = [];

  // Initialize the path
  let path = [];

  // Set the current node to be the start node
  let currentNode = start;

  // Set the start node's g, h, and f values
  start.g = 0;
  start.h = heuristic(start, end);
  start.f = start.g + start.h;

  // While there are nodes in the open set
  while (openSet.length > 0) {
    // Find the node in the open set with the lowest f value
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }

    // Set the current node to be the node with the lowest f value
    currentNode = openSet[lowestIndex];

    // If the current node is the end node, build the path and return it
    if (currentNode === end) {
      let temp = currentNode;
      path.push(temp);
      while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
      }
      return path.reverse();
    }

    // Remove the current node from the open set and add it to the closed set
    openSet.splice(lowestIndex, 1);
    closedSet.push(currentNode);

    // Get the neighbors of the current node
    let neighbors = newMaze.getNeighbors(currentNode);
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];

      // If the neighbor is already in the closed set, skip it
      if (closedSet.includes(neighbor)) {
        continue;
      }

      // Calculate the tentative g value for the neighbor
      let tempG = currentNode.g + 1;

      // If the neighbor is not in the open set, add it
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } 
      // If the neighbor's current g value is greater than the tentative g value, update it
      else if (tempG < neighbor.g) {
        neighbor.g = tempG;
      } 
      // If neither of the above conditions are true, skip this neighbor
      else {
        continue;
      }

      // Set the neighbor's previous node to be the current node
      neighbor.previous = currentNode;

      // Set the neighbor's h and f values
      neighbor.h = heuristic(neighbor, end);
      neighbor.f = neighbor.g + neighbor.h;
    }
  }

  // If there are no nodes in the open set and the end node has not been reached, return an empty path
  return [];
}

// The heuristic function calculates the Euclidean distance between two nodes
function heuristic(a, b) {
  let distance = Math.sqrt(Math.pow(b.colNum - a.colNum, 2) + Math.pow(b.rowNum - a.rowNum, 2));
  return distance;
}

  function getLineWidth(rows, columns) {
    const size = Math.min(rows, columns);
    if (size <= 10) {
      return 8;
    } else if (size <= 20) {
      return 10;
    } else if (size <= 30) {
      return 11;
    } else {
      return 12;
    }
  }
  
  function highlightPath(rows, columns, path) {
    ctx.beginPath();
    ctx.strokeStyle = '#FFA500';
    const lineWidth = getLineWidth(newMaze.rows, newMaze.columns);
    ctx.lineWidth = lineWidth;
      
    for (let i = 0; i < path.length - 1; i++) {
      let x1 = path[i].colNum * (size.value / columns) + size.value / (2 * columns);
      let y1 = path[i].rowNum * (size.value / rows) + size.value / (2 * rows);
      let x2 = path[i + 1].colNum * (size.value / columns) + size.value / (2 * columns);
      let y2 = path[i + 1].rowNum * (size.value / rows) + size.value / (2 * rows);
      
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    
    ctx.stroke();
  }
  