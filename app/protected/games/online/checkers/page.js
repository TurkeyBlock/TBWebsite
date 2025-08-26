"use client"
import styles from "./page.module.css";

import {useState, forwardRef, useImperativeHandle} from "react";

const Checkers = forwardRef(({inLobby = false, gameId = null, onlineMakeMove, onlineResetGame, sendingAction = false, setErrorMessage}, ref) => {

  function newGame() {
    let returnGame = {
        board: Array(8).fill(null).map(() => Array(8).fill(null)),
        nextToken: "X",

        moveStack: Array(0)
    }
    returnGame.board[0] = ['o',null,'o',null,'o',null,'o',null]
    returnGame.board[1] = [null,'o',null,'o',null,'o',null,'o']

    returnGame.board[6] = ['x',null,'x',null,'x',null,'x',null]
    returnGame.board[7] = [null,'x',null,'x',null,'x',null,'x']
    return returnGame;
  };
  const [game, setGame] = useState(newGame);
  const [winner, setWinner] = useState(null);

  const [movingGame, setMovingGame] = useState(newGame);
  const [canJump, setCanJump] = useState(true); //Can't jump after MOVING
  //const [canMove, setCanMove] = useState(true); equivalent to moveStack.length == 0

  const [highlightLocations, setHighlightLocations] = useState([]);

  function calculateWinner(gamestate){
    let tokenExists = false;
    //Iterate through every location on the board (it's small.)
    for(let row in gamestate.board){
        for(let col in gamestate.board[row]){
            //Next Token is the token that will be playing, 
            // so it's the token that may have had pieces taken in the turn we're checking.
            if (gamestate.board[row][col] == gamestate.nextToken){
                tokenExists = true;
                break;
            }
        }
    }
    if(tokenExists){
        return;
    }
    //Else
    setWinner(gamestate.token == 'X'?'O':'X');
  }

  //look for diagonal squares containing [type]. (null would be empty, movable-to squares)
  function getTargets(gameState, startingIndex){
    let canMove = true;

    //You can not move after moving or jumping
    //First on the stack is the selected piece's starting location
    if(gameState.moveStack.length != 1){
        canMove = false;
    }
    //const startingIndex = moveStack[moveStack.length-1];
    const sCol = startingIndex % 8;
    const sRow = parseInt(startingIndex / 8);

    const defaultDirection = gameState.nextToken == 'X' ? -1 : 1; //Default X direction is up (negative)
    const oppToken = gameState.nextToken == 'X' ? 'O':'X';

    let targetArray = [];


    function isInBounds(row,col){
        const maxRow = 8;
        const maxCol = 8;
        if(row >= 0 && row < maxRow && col >= 0 && col < maxCol){
            return true;
        }
        return false;
    }

    //Checks a diagonal direction.
    function subComponent(rowDir, colDir){ // +/-1  for each
        if(!isInBounds(sRow+rowDir, sCol+colDir)){
            console.log('oob');
            return [];
        }
        if(canMove && gameState.board[sRow + defaultDirection][sCol + 1] == null){
            targetArray.push((sRow+rowDir)*8 + (sCol + colDir));
        }
        else if (canJump && gameState.board[sRow + rowDir][sCol + colDir]?.toUpperCase() == oppToken
            && isInBounds(sRow + rowDir*2, sCol + colDir*2)
            && gameState.board[sRow + rowDir*2][sCol + colDir*2]
            ){
            targetArray.push((sRow + rowDir*2)*8 + (sCol + colDir*2))
        }
    }

    //right or left diagonal
    subComponent(defaultDirection, 1); 
    subComponent(defaultDirection, -1);

    //If kinged piece, it can go 'backwards'
    console.log(gameState.board);
    console.log('targeting: '+sRow + " " + sCol);
    if(gameState.board[sRow][sCol] === gameState.board[sRow][sCol]?.toUpperCase()){
        subComponent(-defaultDirection, 1); 
        subComponent(-defaultDirection, -1);
    }
    console.log(targetArray);
    return targetArray;
  }

  const prepMove = async (index) => {

    const updatedMovingGame = {
        board: movingGame.board.map(innerArray => [...innerArray]),
        nextToken: movingGame.nextToken,
        moveStack: movingGame.moveStack,
    };

    const col = index % 8;
    const row = parseInt(index / 8);
    console.log(movingGame.moveStack);
    //setErrorMessage("");
    //If there are no prior selections this turn, then we're selecting a token of this player's type to move.
    if(movingGame.moveStack.length == 0){
        if(movingGame.board[row][col]?.toUpperCase() == movingGame.nextToken){
            //init an editable game with current game-state.
            console.log('recording move: '+index);
            movingGame.moveStack.push(index);
            const Hltemp = getTargets(movingGame, movingGame.moveStack[movingGame.moveStack.length - 1]);
            console.log("setting HL locations: "+Hltemp);
            setHighlightLocations(Hltemp)
            console.log(highlightLocations);
            //setMovingGame(movingGame)
        }
        else{
            console.log('invalid intial select');
            //User selected an empty (or unowned) space
        }

        return;
    }
    //The following selection(s) are moves, or jumps.
    console.log("HL Locations:"+ highlightLocations);
    if(highlightLocations.includes(index)){
        movingGame.moveStack.push(index);
        setHighlightLocations(getTargets(movingGame, movingGame.moveStack[movingGame.moveStack.length - 1]));
    }
    else{
        console.log('invalid post-selection move');
    }
  }

  function makeMove(override = true){
    if(movingGame.moveStack.length <= 0){
        if(override == true)
            console.log('no moves logged - but hey, you the boss.')
        else{
            console.log('Future implimentation may prevent this submission')
        }
    }
    //Commits the movingGame.moveStack to game
    const updatedGame = {
        board: movingGame.board.map(innerArray => [...innerArray]),
        nextToken: movingGame.nextToken,
        moveStack: []
    };
    console.log(updatedGame)
    for(let i = 0; i <= movingGame.moveStack.length-1; i++){
        const index = movingGame.moveStack[i];
        console.log(index);
        const col = index % 8;
        const row = parseInt(index / 8);
        if(i == movingGame.moveStack.length-1){
            updatedGame.board[row][col] = updatedGame.nextToken;
            updatedGame.nextToken = updatedGame.nextToken == 'X' ? 'O':'X';
        } else{

            updatedGame.board[row][col] = null;
        }
    } 
    
    console.log(updatedGame);
    setGame(updatedGame);
    setMovingGame(updatedGame); //Clears the moveStack, keeps current state
  }

  const resetGame = async () => {
    if(inLobby===true){
      setErrorMessage("");
      onlineResetGame();
    }
    else{
      localResetGame();
    }
  };

  function localResetGame(){
    //setErrorMessage("");
    setGame(newGame);
    setMovingGame(newGame);
  }

  const loadGame = async (game) => {
    setGame(game);
    setMovingGame(game);
    calculateWinner(game);
  }
  
  useImperativeHandle(ref, () => ({
    loadGame:loadGame,
    localResetGame:localResetGame
  }));

  return (
        <div className={styles.appContainer}>
            <div style={{display:"flex", width:"100%", alignContent:"center", justifyContent:"center"}}>
                <h1 className = {styles.gameMode}>{
                    !inLobby
                    ? 'Singleplayer':
                    `Game ID: ${gameId}`
                }</h1>
            </div>
            {game.moveStack}
            <div className = {styles.board}>
                {/*--------------------*/}
                {game.board.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className = {styles.row}
                    >
                    {row.map((col, colIndex) => (
                        <div
                            key={colIndex}
                            //className = {styles.cell}
                            className = {`${(rowIndex%2 == colIndex%2 )?'color0':'color5'}
                                ${styles.cell}
                                ${sendingAction ? styles.loadingCursor : ''}

                                ${highlightLocations.includes(rowIndex*8+colIndex) ? 'color1' : 'color0'}
                            `}
                            onClick={() => prepMove(rowIndex*8+colIndex)}
                        >
                        {game.board[rowIndex][colIndex]==null ? (rowIndex*8+colIndex)
                        :   <div
                                className = {`${styles.token}
                                    ${game.board[rowIndex][colIndex].toUpperCase()=='X' ? styles.tokenX
                                    : styles.tokenO
                                    }
                                `}
                            >
                                {game.board[rowIndex][colIndex]}
                            </div>
                        }
                        </div>
                    ))}
                    </div>
                ))}
            </div>
            <p className={styles.winnerChatt}>
                {winner
                ? `Token ${winner} wins!`:
                `Current Token: ${game.nextToken}`}
            </p>
            <button className={`${styles.resetButton}
                ${sendingAction ? styles.loadingCursor
                : ''}`
                } 
                onClick={resetGame}
            >
                Reset Game
            </button>
            <button onClick = {makeMove}>
                Commit Move
            </button>
        </div>
    );
});

Checkers.displayName = 'Offline Checkers';
export default Checkers;
