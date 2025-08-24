"use client"
import styles from "./page.module.css";

import {useState, forwardRef, useImperativeHandle} from "react";

const Checkers = forwardRef(({inLobby = false, gameId = null, onlineMakeMove, onlineResetGame, sendingAction = false, setErrorMessage}, ref) => {

  const newGame = {
    board: Array(8).fill(null).map(() => Array(8).fill(null)),
    nextToken: "X",
  };
  const [game, setGame] = useState(newGame);
  const [winner, setWinner] = useState(null);

  const [movingGame, setMovingGame] = useState(newGame);
  const [moveStack, setMoveStack] = useState([]);
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
  function getTargets(gameState){
    let canMove = true;

    //You can not move after moving or jumping
    //First on the stack is the selected piece's starting location
    if(moveStack.length != 1){
        canMove = false;
    }
    const startingIndex = moveStack[moveStack.length-1];
    const sCol = startingIndex % 8;
    const sRow = startingIndex / 8;

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
        if(canMove && gameState.board[sRow + defaultDirection][sCol + 1] == null){
            targetArray.push((sRow+rowDir)*8 + (sCol + colDir));
        }
        else if (canJump && gameState.board[sRow + rowDir][sCol + colDir].toUpperCase() == oppToken
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
    if(gameState.board[sRow][sCol] === gameState.board[sRow][sCol].toUpperCase()){
        subComponent(-defaultDirection, 1); 
        subComponent(-defaultDirection, -1);
    }
    return targetArray;
  }

  const makeMove = async (index) => {
    //index is the target location, not the starting position.
    const startingIndex = moveStack[moveStack.length-1];
    const sCol = startingIndex % 8;
    const sRow = startingIndex / 8;
    setErrorMessage("");
    //If there are no prior selections this turn, then we're selecting a token of this player's type.
    if(moveStack == [] && game.board[index] == game.nextToken){
        //init an editable game with current game-state.
        setMoveStack(moveStack => moveStack.push(index));
        setMovingGame(game)
    }
    //The following selection(s) are moves, or jumps.

    setMoveStack(moveStack => moveStack.push(index))
  }

});
