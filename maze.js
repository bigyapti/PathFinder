//initialize canvas for drawing 


let m = document.querySelector(".maze")
let ctx = m.getContext("2d");
let current;
let final;
let mazeComplete = false;

class maze{
    constructor(size, rows, columns){
        this.size = size;//size in pixels 
        this.rows = rows; 
        this.columns = columns ;
        this.grid = [];
        this.stack = [];
    }

    getNeighbors(cell) {
        let neighbors = [];
        let grid = this.grid;
        let row = cell.rowNum;
        let col = cell.colNum;
      
        // Check top neighbor
        if (row > 0 && !grid[row - 1][col].walls.bottomWall) {
          neighbors.push(grid[row - 1][col]);
        }
      
        // Check right neighbor
        if (col < this.columns - 1 && !cell.walls.rightWall) {
          neighbors.push(grid[row][col + 1]);
        }
      
        // Check bottom neighbor
        if (row < this.rows - 1 && !cell.walls.bottomWall) {
          neighbors.push(grid[row + 1][col]);
        }
      
        // Check left neighbor
        if (col > 0 && !grid[row][col - 1].walls.rightWall) {
          neighbors.push(grid[row][col - 1]);
        }
      
        return neighbors;
      }
      
    //setup 2d grid by adding cell instance to it
    set(){
        for (let r = 0; r < this.rows ; r++){
            let row = [];
            for (let c = 0; c<this.columns; c++){
                let cell = new Cell(r, c, this.grid, this.size);
                row.push(cell);
            }
            this.grid.push(row);
        }
        current = this.grid[0][0];// first cell initialized as current
        this.grid[this.rows-1][this.columns-1].final=true;//final cell 


    }
    draw(){
        //draw canvas
       m.width = this.size;
       m.height = this.size;
       m.style.background = 'black';
       //set first cell as visited
       current.visited = true;
       //display cell for each cell in 2d grid 
       for (let r = 0; r < this.rows ; r++){
        for (let c = 0; c<this.columns; c++){
            let grid = this.grid;
            grid[r][c].displaycell(this.size, this.rows, this.columns);
        }
        
    }
    //gets random neighbor of the current cell and assigns to next
    let next = current.findneighbors();
    //if neighbors exist
    if(next){

            next.visited = true;
            //current cell added to stack for backtracking
            this.stack.push(current);
            //highlights current cell
            current.highlight(this.rows, this.columns);
            //compares current cell and next cell and removes the walls accordingly
            current.removeWalls(current, next);

            //sets next cell as current cell
            current = next;

        }
    //no neighbors start backtracking using already visited cells in stack
        else if (this.stack.length>0){

            let prevCell = this.stack.pop();
            current = prevCell;
            //backtracking highlighted
            current.highlight(this.rows, this.columns);

        }
        // If stack empty then all cells visted and exit
        if (this.stack.length === 0){

            mazeComplete = true;
            return;      
        }
       //calls draw recursively till exit condition is met
       window.requestAnimationFrame(()=>{
           this.draw();
       });
    }
}
class Cell{
    constructor (rowNum , colNum ,mazeGrid , mazeSize){

        this.rowNum = rowNum;
        this.colNum = colNum;
        this.mazeGrid = mazeGrid;
        this.mazeSize = mazeSize;
        this.visited = false;
        this.final = false;
        this.walls = {
            topWall : true,
            rightWall : true,
            bottomWall : true,
            leftWall: true,

        };
        this.neighbors=[]// add neighbors property
        this.parent = null; // add parent property for A* pathfinding
        this.f = 0; // add f property for A* pathfinding
        this.g = 0; // add g property for A* pathfinding
        this.h = 0; // add h property for A* pathfinding // add neighbors property
    }
    drawTop(x, y, rows, columns, size ){
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x+size/columns,y);
        ctx.stroke();
    }
    drawRight(x, y,rows, columns, size ){
        ctx.beginPath();
        ctx.moveTo(x+size/columns,y);
        ctx.lineTo(x+size/columns,y+size/rows);
        ctx.stroke();
    }
    drawBottom(x, y,rows, columns, size ){
        ctx.beginPath();
        ctx.moveTo(x+size/columns,y+size/rows);
        ctx.lineTo(x,y+size/rows);
        ctx.stroke();
    }
    drawLeft(x, y,rows, columns, size ){
        ctx.beginPath();
        ctx.moveTo(x,y+size/rows);
        ctx.lineTo(x,y);
        ctx.stroke();
    }
    displaycell(size, rows, columns){
        let x = this.colNum*(size/columns);//in pixels for screen 
        let y = this.rowNum*(size/rows);//in pixels 
        ctx.strokeStyle='white';
        ctx.fillStyle = 'black';
        ctx.lineWidth = 5;
        //draw walls as lines only if wall is set to true at cell constructor 
        if (this.walls.topWall) this.drawTop(x,y,rows, columns , size);
        if (this.walls.rightWall) this.drawRight(x,y,rows, columns , size);
        if (this.walls.leftWall) this.drawLeft(x,y,rows, columns , size);
        if (this.walls.bottomWall) this.drawBottom(x,y,rows, columns , size);
        //colors final cell
        if(this.final){
            
            ctx.fillStyle = "#FFA500";
            ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);

        }
        
     
    

    }
    findneighbors(){
        let row = this.rowNum;
        let col = this.colNum;
        let grid = this.mazeGrid;
        let neighbors =[];
        //obtains the possible 4 neighbours according to coordinates and returns undefined if out of bounds(edges)
        let top = row !== 0?grid[row-1][col]:undefined;
        let right = col !== (grid.length - 1)?grid[row][col+1]:undefined;
        let bottom = row !== (grid.length - 1)?grid[row+1][col]:undefined;
        let left = col !== 0?grid[row][col-1]:undefined;

        //if not undefined push into neighbors array
        if (top && !top.visited) {
            neighbors.push(top);
        }
        if (right && !right.visited) {
            neighbors.push(right);
        }
        if (bottom && !bottom.visited) {
            neighbors.push(bottom);
        }
        if (left && !left.visited) {
            neighbors.push(left);
        }
        //obtains random neighbor out of the 4 and returns it  
        if (neighbors.length!==0 ){
            
            let random = Math.floor(Math.random()*neighbors.length);
            return neighbors[random];

        }//if no neighbor returns undefined 
        else {
            return undefined;
        }
    }
    removeWalls(cell1, cell2){

        let dx = cell1.colNum - cell2.colNum;//compares 2 cells on x axis
        let dy = cell1.rowNum - cell2.rowNum;// compares 2 cells on y axis
        //removes relevant walls if there is a difference in x axis
        if(dx==1){
            cell1.walls.leftWall =false;
            cell2.walls.rightWall = false;
        }
        if(dx==-1){
            cell1.walls.rightWall =false;
            cell2.walls.leftWall= false;
        }
        //removes relevant walls if there is a difference in y axis
        if(dy==1){
            cell1.walls.topWall =false;
            cell2.walls.bottomWall = false;
        }
        if(dy==-1){
            cell1.walls.bottomWall =false;
            cell2.walls.topWall = false;
        }



    }
    //colors the cell
    highlight(rows, columns){

        let x = this.colNum*(this.mazeSize/columns)+1;
        let y = this.rowNum*(this.mazeSize/rows)+1;


        if(mazeComplete){

            ctx.fillStyle = '#FFA500';
            ctx.fillRect(x, y, this.mazeSize/columns-1, this.mazeSize/rows-1);

        }
    
        else{

            ctx.fillStyle = '#FFA500';
            ctx.fillRect(x, y, this.mazeSize/columns-2, this.mazeSize/rows-2);

        }
    }
    highlightcurrent(rows, columns){
        
        let x = this.colNum*(this.mazeSize/columns);
        let y = this.rowNum*(this.mazeSize/rows);
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(x, y, this.mazeSize/columns-1, this.mazeSize/rows-1);


    }

   
}

