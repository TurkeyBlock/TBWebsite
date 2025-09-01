"use client"
import styles from "./page.module.css";

import {useState, forwardRef, useImperativeHandle} from "react";

const Checkers = forwardRef(({inLobby = false, gameId = null, onlineMakeMove, onlineResetGame, onlineVerifyTurn, sendingAction = false, setErrorMessage}, ref) => {

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
            if (gamestate.board[row][col]?.toUpperCase() == gamestate.nextToken){
                tokenExists = true;
                break;
            }
        }
    }
    if(tokenExists){
        return;
    }
    //Else
    setWinner(gamestate.nextToken == 'X'?'O':'X');
  }

  //look for diagonal squares containing [type]. (null would be empty, movable-to squares)
  function getTargets(gameState, startingIndex, localCanJump){
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
            return;
        }
        if(canMove && gameState.board[sRow+rowDir][sCol+colDir] == null){
            targetArray.push((sRow+rowDir)*8 + (sCol + colDir));
        }
        else if (localCanJump && gameState.board[sRow + rowDir][sCol + colDir]?.toUpperCase() == oppToken
            && isInBounds(sRow + rowDir*2, sCol + colDir*2)
            && gameState.board[sRow + rowDir*2][sCol + colDir*2] == null
        ){
            targetArray.push((sRow + rowDir*2)*8 + (sCol + colDir*2))
        }
    }

    //right or left diagonal
    subComponent(defaultDirection, 1); 
    subComponent(defaultDirection, -1);

    //If kinged piece, it can go 'backwards'
    if(gameState.board[sRow][sCol] === gameState.board[sRow][sCol]?.toUpperCase()){
        subComponent(-defaultDirection, 1); 
        subComponent(-defaultDirection, -1);
    }
    return targetArray;
  }

  const prepMove = async (index, multiplayerReplay = false) => {
    //If in lobby & it's not your turn & it's NOT a new game, don't prep moves
    if(inLobby && !onlineVerifyTurn() && JSON.stringify(game.board) != JSON.stringify(newGame().board)){
        console.log('blocked- not your turn');
        return;
    }
    let localCanJump = canJump;

    const col = index % 8;
    const row = parseInt(index / 8);

    //Select a new token to move (If no movements have occured)
    //Ease of use feature - no need to hit undoMove if you select the wrong token.
    if(movingGame.moveStack.length == 1 && movingGame.board[row][col]?.toUpperCase() == movingGame.nextToken){
        movingGame.moveStack = [];
        setHighlightLocations([]);
    }

    //setErrorMessage("");
    //If there are no prior selections this turn, then we're selecting a token of this player's type to move.
    if(movingGame.moveStack.length == 0){
        if(movingGame.board[row][col]?.toUpperCase() == movingGame.nextToken){
            //init an editable game with current game-state.
            movingGame.moveStack.push(index);
            setCanJump(true);
            localCanJump = true;
        }
        else{
            //User selected an empty (or unowned) space
            console.log('invalid intial select');
            return
        }
    }
    else {
        //We've already selected a piece for this turn, so...
        //The following selection(s) are moves, or jumps.

        //Remember: verification is handled by getTargets; this just does the request.
        if(highlightLocations.includes(index)){
            //The location is valid, record the action.
            movingGame.moveStack.push(index);

            //get previous location of token
            const lastLoc = movingGame.moveStack[movingGame.moveStack.length-2];
            const lastRow = parseInt(lastLoc/8);
            const lastCol = lastLoc%8;

            //Check if token jumped or moved (2 || 1)
            const colDif = lastCol - col;
            if(Math.abs(colDif) >=2){
                //delete the token that was jumped
                const rowDif = lastRow - row;
                movingGame.board[row+Math.sign(rowDif)][col+Math.sign(colDif)] = null;
            }
            else{
                //This token moved, so it can no longer jump (or move, but that's pre-handled))
                setCanJump(false);
                localCanJump = false;
            }


            //Getting the token that moved
            let lastLocToken = movingGame.board[lastRow][lastCol];
            
            //If a token has reached the opposite end of the board (and is unKinged), King it.
            if((lastLocToken == 'x' && index < movingGame.board[0].length ) || (lastLocToken == 'o' && index >= (movingGame.board[0].length*movingGame.board.length - movingGame.board[0].length))){
                lastLocToken = lastLocToken.toUpperCase();
            }

            //Visibly move the token, deleting last location
            movingGame.board[row][col] = lastLocToken;
            movingGame.board[lastRow][lastCol] = null;
        }
        else{
            console.log('invalid post-selection move');
            return;
        }
    }
    setHighlightLocations(getTargets(movingGame, movingGame.moveStack[movingGame.moveStack.length - 1], localCanJump));
  }

  function makeMove(){
    if(movingGame.moveStack.length <= 0){
        console.log('Future implimentation may prevent this submission')
    }

    //Multiplayer
    if(inLobby===true){
        let isNewGame = false;
        if(JSON.stringify(game.board)==JSON.stringify(newGame().board)){
            isNewGame = true;
        }
        let moveString = "";
        for(let i = 0; i<movingGame.moveStack.length; i++){
            moveString+=movingGame.moveStack[i];
            if(i!=movingGame.moveStack.length-1){
                moveString+=" ";
            }
        }
        onlineMakeMove(isNewGame, ("MOVE "+moveString))
    }
    else{
        //Commits the movingGame.moveStack to game
        const updatedGame = {
            board: movingGame.board.map(innerArray => [...innerArray]),
            nextToken: movingGame.nextToken == 'X' ? 'O':'X',
            moveStack: []
        };
        setGame(JSON.parse(JSON.stringify(updatedGame)));
        setMovingGame(updatedGame); //Clears the moveStack, keeps current state
        calculateWinner(updatedGame);
        setHighlightLocations([]);
    }
  }

  //I'm not currently storing enough information to do incremental undos- this is an all/nothing
  function undoMove(){
    setMovingGame(JSON.parse(JSON.stringify(game)));
    setHighlightLocations([]);
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
    setGame(newGame());
    setMovingGame(newGame());
    setHighlightLocations([]);
    setWinner(null);
  }

  const loadGame = async (loadedGame) => {
    //If a movestack exists, move through it for aesthetic purposes.
    //If there's a desync, this could be wierd...

    //But in the end, desyncs don't matter because we 'manually' set the game to the end result.
    function syncLoadGame(){
        let prunedGame = {
            board: loadedGame.board,
            nextToken: loadedGame.nextToken,
            moveStack: [],
        }
        
        setGame(JSON.parse(JSON.stringify(prunedGame)));
        setMovingGame(prunedGame);
        setHighlightLocations([]);
        calculateWinner(prunedGame);
    }
    
    //0 is empty, 1 is selection but no movement
    if(loadedGame.moveStack.length>1){
        //The player who submitted this move doesn't need to see the replay
        if(JSON.stringify(loadedGame.board) != JSON.stringify(movingGame.board)){
            let prevRow = null
            let prevCol = null
            let token = null;

            for(let i = 0; i < loadedGame.moveStack.length; i++){
                setTimeout(() => {
                    const index = loadedGame.moveStack[i]
                    
                    const col = index % 8;
                    const row = parseInt(index / 8);

                    if(i+1 < loadedGame.moveStack.length){
                        setHighlightLocations([loadedGame.moveStack[i+1]]);
                    }

                    if(prevRow && prevCol){
                        movingGame.board[prevRow][prevCol] = null;
                        movingGame.board[row][col] = token;
                    }
                    else{
                        token = movingGame.board[row][col];
                    }

                    prevRow = row;
                    prevCol = col;
                    if(i == loadedGame.moveStack.length-1){
                        syncLoadGame()
                    }
                }, i*500);
            }
        }
        else{
            syncLoadGame()
        }
    }
    else{
        localResetGame();
    }
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
            {movingGame.moveStack}
            <div className = {styles.board}>
                {/*--------------------*/}
                {movingGame.board.map((row, rowIndex) => (
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
                            `}
                            style={{border: `${highlightLocations.includes(rowIndex*8+colIndex) ? 'gold 3px solid': ''}`}}
                            onClick={() => prepMove(rowIndex*8+colIndex)}
                        >
                        {movingGame.board[rowIndex][colIndex]==null ? (rowIndex*8+colIndex)
                        :   <div
                                className = {`${styles.token}
                                    ${movingGame.board[rowIndex][colIndex].toUpperCase()=='X' ? styles.tokenX
                                    : styles.tokenO
                                    }
                                `}
                            >
                                {movingGame.board[rowIndex][colIndex]}
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
            <button 
            onClick = {makeMove}
            className={`${styles.resetButton}`}
            style={{
                backgroundColor: `${(movingGame.moveStack.length > 1) ? 'blue' : 'red'}`,
                outline: `${movingGame.moveStack.length > 1 && highlightLocations.length == 0 ? 'gold 5px solid': ''}`
            }}
            >
                Commit Move
            </button>
                <button className={`${styles.resetButton}`}
                onClick={undoMove}
            >
                Undo Move
            </button>
        </div>
    );
});

Checkers.displayName = 'Offline Checkers';
export default Checkers;
