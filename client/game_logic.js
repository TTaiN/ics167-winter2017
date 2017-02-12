/* Layout */
const COLS = 30;
const ROWS = 30;
const cell_dim = 15;
const width = COLS * cell_dim;
const height = ROWS * cell_dim;

const p1_scoretext_x = 325; 	//Coordinates for int score text
const p2_scoretext_x = 75;
const scoretext_y = 50;

/* Settings for gameplay */
const INIT_SNAKE_LENGTH = 2;      // Default length of snake
const INTERVAL = 60;                // Loop every 60 milliseconds
const INIT_REWARD_NUMBER = 2;      

/* Keyboard matching */
const LEFT = -1;           // If a snake is going left, its x variable will be add LEFT, that is -1, for each loop. 
const RIGHT = 1;           // And when the snake goes left or right, its vertical direction will add NONE, that is 0.
const UP = -1;
const DOWN = 1;
const NONE = 0;

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RIGHT = 39;
const KEY_LEFT = 37;
const KEY_W = 87;
const KEY_S = 83;
const KEY_D = 68;
const KEY_A = 65;

/* Literal flags */
const NOT_COLLIDE = -1;

var win_Canvas;			// Top Text Canvas
var win_Ctx;
var canvas;
var ctx;
var text_Canvas;		// Bottom Text Canvas
var text_Ctx;

var game_interval_ID;       // When the game should be ended, this ID is passed to the function clearInterval(ID) to end the loop.

var p1_score;
var p2_score;

var p1_Hori;     // Horizontal velocity of player 1 snake. When receiving an input, for example, LEFT_ARROW from keyboard, p1_Hori will be set to LEFT;
var p1_Vert;     // Then each loop the player 1 snake's horizontal value: x will add LEFT which is -1.
var p2_Hori;
var p2_Vert;
  
var p1snake;
var p2snake;

var obstacles;
var rewards;

var p1_win;			// Game winner variables
var p2_win;
var tie_game;

var playernumber;

function init_canvas() 
{
	// Create and initiate top text canvas element
	win_Canvas = document.getElementById("winCanvas");
    win_Canvas.width = width;
    win_Canvas.height = height/8;
    win_Ctx = win_Canvas.getContext("2d");
    
    // Create and initiate the canvas element
    canvas = document.getElementById("myCanvas");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
  
	// Create and initiate bottom text canvas element
	text_Canvas = document.getElementById("textCanvas");
    text_Canvas.width = width;
    text_Canvas.height = height/8;
    text_Ctx = text_Canvas.getContext("2d");
    
	// Draw const bottom text
	text_Ctx.fillStyle = 'blue';
	text_Ctx.fillText("Blue Snake - WASD", 10, scoretext_y-30);
	text_Ctx.fillText("Blue Score:", 10, scoretext_y);
	text_Ctx.fillStyle = 'red';
	text_Ctx.fillText("Red Snake - Arrow Keys", 260, scoretext_y-30);
	text_Ctx.fillText("Red Score:", 260, scoretext_y);
}


// If a snake goes left, it cannot go right.
function init_input()
{
    document.addEventListener('keydown', function(e)
    {   
        if(e.keyCode === KEY_DOWN||e.keyCode === KEY_S && p1_Vert != UP) {
			sendSetPlayerDirectionEvent(playernumber, "DOWN")
        } else if(e.keyCode === KEY_UP||e.keyCode === KEY_W && p1_Vert != DOWN) {
			sendSetPlayerDirectionEvent(playernumber, "UP")
        } else if(e.keyCode === KEY_LEFT ||e.keyCode === KEY_A && p1_Hori != RIGHT){
			sendSetPlayerDirectionEvent(playernumber, "LEFT")
        } else if(e.keyCode === KEY_RIGHT||e.keyCode === KEY_D && p1_Hori != LEFT){
			sendSetPlayerDirectionEvent(playernumber, "RIGHT")
        }
    },false);
}


function init_obstacles()
{   
    obstacles = [];
    
    // Manully add obstacles
    create_obstacle(5,5,4,"Vertical");
    create_obstacle(10,10,7,"Vertical");  
    create_obstacle(20,20,5,"Horizontal");
    create_obstacle(18,10,5,"Horizontal");
}


function init_rewards()
{
    rewards = [];

    if(playernumber==1)
    {
	for(var i=0; i<INIT_REWARD_NUMBER; i++)
    	{
    	    randomize_reward();
    	}
    }
}


// Create a reward at a random place that does not collide with other snake or obstacles.
// And at the end the reward is pushed to the rewards array.
function randomize_reward()
{
	if(playernumber==1)
	{
    		var random_pos;
    		do {
        		random_pos = [{x:randomize_number(0,29),
                       			y:randomize_number(0,29)}];   
    		   }while(detect_collision(random_pos,p1snake,0) != NOT_COLLIDE || 
           		  detect_collision(random_pos,p2snake,0) != NOT_COLLIDE || 
           		  detect_collision(random_pos,obstacles,0) != NOT_COLLIDE);
		sendRewardCoordinates(random_pos[0].x,random_pos[0].y);
    		//rewards.push(random_pos[0]);
	}
}

// Return a random number [from,to]  from,to both included.
function randomize_number(from,to)
{
    return Math.floor((Math.random()*(to+1)+from));
}


// Create n dots start from the dot(pos_x,pos_y) at the direction either "Horizontal" or "Vertical"
// If you pass in (5,5,5,"Vertical") it creates (5,5) all the way to (5,9) included
// Make sure the values you pass in do not collide  with the snake's spwaning position
function create_obstacle(pos_x,pos_y,n,direction)
{
    if(direction==="Horizontal")
    {
        for(var end = pos_x+n; pos_x<end; pos_x++)
        {
            obstacles.push({x:pos_x, y:pos_y});
        }
    }
    else if(direction==="Vertical")
    {
        for(var end = pos_y+n; pos_y<end; pos_y++)
        {
            obstacles.push({x:pos_x, y:pos_y});
        }
    }
}
function determine_winner()
{
	// Checks for collision. Returns 1 if collision was made, -1 otherwise.
	var return_val = -1;
	// Check if p1 snake collided. If it did, p2 has a potential to win.
	if(detect_collision(p1snake,p1snake,1)   != NOT_COLLIDE || 
       detect_collision(p1snake,p2snake,0)   != NOT_COLLIDE ||
	   detect_collision(p1snake,obstacles,0) != NOT_COLLIDE ||
       detect_out_of_bound(p1snake)          != NOT_COLLIDE)
	{
		p2_win = true;
		return_val=1;

		if (online)
		{
			sendGameFinishedEvent();
		}
	}

	// Check if p2 snake collided. If it did, p1 has a potential to win.
	if (detect_collision(p2snake,p2snake,1)     != NOT_COLLIDE || 
        detect_collision(p2snake,p1snake,0)     != NOT_COLLIDE ||
		detect_collision(p2snake,obstacles,0)   != NOT_COLLIDE ||
	    detect_out_of_bound(p2snake)            != NOT_COLLIDE)
	{
		p1_win = true;
		return_val=1;

		if (online)
		{
			sendGameFinishedEvent();
		}
	}

	// Check if both snakes collided, determine whether the game is tied based on same score.
	// If they have different scores, the highest scoring snake wins and their win value remain true.
	if(p1_win && p2_win){
		if(p1_score == p2_score) {
			tie_game = true;
			p1_win  = false;
			p2_win  = false;
		} else if (p1_score > p2_score){
			p2_win = false;
		} else {
			p1_win = false;	
		}

		if (online)
		{
			sendGameFinishedEvent();
		}
	}
	return return_val;
}

function win_message()
{
	// Displays Win Message based on which win value is true.
	win_Ctx.fillStyle = 'black';
	if(tie_game) {
		win_Ctx.fillText("Tie Game!", (width/2)-23, 25);
	} else if (p1_win) {
		win_Ctx.fillText("Red Snake Wins!", (width/2)-40, 25);
	} else if (p2_win) {
		win_Ctx.fillText("Blue Snake Wins!", (width/2)-40, 25);
	}
	
}

function update()
{
    // Detect if condition is satisifed to pause the game.
    if( determine_winner()!=NOT_COLLIDE)
    {   
        // Loop stop
        clearInterval(game_interval_ID);
	    
	    // Display Win Message based on winner
	    win_message();
	    
        // Restart button pops up
	if(playernumber == 1)
	{
		document.getElementById('Restart').style.visibility = 'visible';
	}
    }
    
    // Remove reward from the rewards array if there is any, add a new reward after removing.
    process_rewards(detect_rewards());  
}


function loop()
{
    // Process the logic before go on drawing.
    update();

    draw();
    
    move();
}

function init_objects()
{
    init_snakes();
    init_obstacles();    
    init_rewards(); 
}

function init_win_variables()
{
	// These are reset in when main is called in the case of a game restart.
	p1_win = false;
	p2_win = false;
	tie_game = false;
}

function main()
{
    init_win_variables();
    init_canvas();
    init_input();
    init_objects();
     
    // Set the loop function to be called every x milliseconds, x to be INTERVAL.
    game_interval_ID = setInterval(loop,INTERVAL);
    loop();
}


function move()
{
    // Delete the end for each snake.
    p1snake.pop();
    p2snake.pop();
    
    // Add new head for each snake. The new head should be one unit forward towards the direction
    // The direction is either -1,0,1, updated automatically when receiving input. The input listener is set up
    // in the function init_input().
    p1snake.unshift( {x:p1snake[0].x + p1_Hori,
                      y:p1snake[0].y + p1_Vert} );
    p2snake.unshift( {x:p2snake[0].x + p2_Hori,
                      y:p2snake[0].y + p2_Vert} );       
}


// This requires the snake's initial length to be at least 2.
function add_tail(sak)
{
    var len = sak.length;
    var x_value = (sak[len-1].x - sak[len-2].x) + sak[len-1].x;
    var y_value = (sak[len-1].y - sak[len-2].y) + sak[len-1].y;

    sak.push({x:x_value, y:y_value});
}


// Creating snakes array and posistions
// Snake have the structures like [{x:10,y:0},{x:11,y:0},{x:12,y:0}], each dictionary represents a unit of the snake, x,y are positions.
// The board is a 30x30 space, start with the first row 0, and last row 29, first column 0 and last column 29
function init_snakes()
{
	p1snake = [];
	p2snake = [];
	
    // J is used to have the right "head" as starting position, see move() for detail
	var j = INIT_SNAKE_LENGTH-1; 
	for(var i = 0; i < INIT_SNAKE_LENGTH; i++)
	{	
		// Initializing player 1 at upper left 
		p1snake.push({x:j--, y:0});
       		
		// Initializing player 2 at lower right
		p2snake.push({x:COLS-INIT_SNAKE_LENGTH+i, y:ROWS-1});
	}
    
    
    // Each snake's beginning heading direction
    // At the beginning of the game, the top left snake goes right, the bottom right snake goes left.
    p1_Hori = RIGHT;
    p1_Vert = NONE;
    
    p2_Hori = LEFT;
    p2_Vert = NONE;

    p1_score = 0;
    p2_score = 0;

    // Writes score text once init values have been defined.
    text_Ctx.fillStyle = 'black'; 
    text_Ctx.fillText(p1_score, p1_scoretext_x, scoretext_y);
    text_Ctx.fillText(p2_score, p2_scoretext_x, scoretext_y);
}


// Clean the canvas so a new frame can be drawn.
function clean_the_board()
{
    ctx.fillStyle = "white";
	ctx.fillRect(0,0,width,height);
	ctx.strokeStyle = "black";
	ctx.strokeRect(0,0, width, height);
}


// Draw the pixels onto the screen
function draw()
{
    clean_the_board();
    
    draw_objects(p1snake,"red");
    draw_objects(p2snake,"blue");
    draw_objects(obstacles,"black");
    draw_objects(rewards,"yellow");
}

function draw_objects(objects,color)
{
    for(var i=0; i<objects.length; i++)
    {
        fill(objects[i].x, objects[i].y, color);
    }
}


// Filling a dot that can be the snake body or the food
function fill(x,y, color) 
{
	ctx.fillStyle = color;
	ctx.fillRect(x*cell_dim, y*cell_dim, cell_dim, cell_dim);
}


// Return 1 if passed snake array goes out of bound, -1 otherwise
function detect_out_of_bound(array)
{   
   // 1 is subtracted from Rows and Collumns because 
   // there are extra free blocks beyond the right and bottom borders.
   // A snake can be on the border and not greater, therefore hiding it
   // in the extra block.
   return (array[0].x<0 || array[0].x>COLS-1 || array[0].y<0 || array[0].y>ROWS-1)? 1:NOT_COLLIDE;   
}


// Return 1 when one of the snakes run into the other, -1 otherwise
// Loop each snake's head looking for if there is any snake head's position is 
// equal to one of the node of its body or the node of the other snake's body.
function detect_snake_collision()
{
   return (detect_collision(p1snake,p1snake,1) != NOT_COLLIDE || detect_collision(p2snake,p2snake,1)!= NOT_COLLIDE ||
            detect_collision(p1snake,p2snake,0)!= NOT_COLLIDE || detect_collision(p2snake,p1snake,0)!= NOT_COLLIDE )? 1:NOT_COLLIDE;
}

function detect_rewards()
{
    var index_1 = NOT_COLLIDE;
    if( (index_1 = detect_collision(p1snake,rewards,0)) != NOT_COLLIDE)
    {

        p1_score++;
        add_tail(p1snake);

		if (online)
		{
			sendPlayerScoreEvent(1);
		}
	    
	    text_Ctx.fillStyle = 'white'; 		// White out old score text.
	    text_Ctx.fillRect(p1_scoretext_x, scoretext_y-10,30,10);
	    text_Ctx.fillStyle = 'black'; 		// Write in new score.
	    text_Ctx.fillText(p1_score, p1_scoretext_x, scoretext_y);
    }

    var index_2 = NOT_COLLIDE;
    if( (index_2 = detect_collision(p2snake,rewards,0)) != NOT_COLLIDE)
    {
        p2_score++;
        add_tail(p2snake);

		if (online)
		{
			sendPlayerScoreEvent(2);
		}
		
	    text_Ctx.fillStyle = 'white'; 		// White out old score text.
    	text_Ctx.fillRect(p2_scoretext_x, scoretext_y-10,30,10);
	    text_Ctx.fillStyle = 'black'; 		// Write in new score.
	    text_Ctx.fillText(p2_score, p2_scoretext_x, scoretext_y)

    }

    return [index_1,index_2];
}

function process_rewards(indexes)
{
    // 2 is the number of snake.
    for(var i=0; i<2; i++)
    {
        if(indexes[i]!=NOT_COLLIDE)
        {
            delete_node(rewards,indexes[i]);
            randomize_reward();

            return NOT_COLLIDE;
        }
    }
}

function delete_node(array,index)
{
    array.splice(index,1);
}


// Detect object1's head against object2's all nodes. Both variables should have the same structure [{x:0,y:0},{x:1,y:0},...]
// If n is 0, it means check object1's head against the nth node of object2 until the end of object2.
// Set to 1 to detect if a snake is running into itself.
// Return index for object detected to have collision, -1 for no collision.
function detect_collision(object1,object2,n)
{
    var object1_x = object1[0].x;
    var object1_y = object1[0].y;
    
    for(var i=n; i<object2.length; i++)
    {
        if(object1_x === object2[i].x && object1_y === object2[i].y)
        {

            return i;
        }
    }
    return NOT_COLLIDE;
}
