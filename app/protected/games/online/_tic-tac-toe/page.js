"use client"
import styles from "./page.module.css";

import {useState, forwardRef, useImperativeHandle} from "react";

const TicTacToe = forwardRef(({inLobby = false, gameId = null, onlineMakeMove, onlineResetGame, sendingAction = false, setErrorMessage}, ref) => {
  
  const newGame = {
    board: Array(9).fill(null),
    nextToken: "X",
  };
  const [game, setGame] = useState(newGame);
  const [winnerArray, setWinnerArray] = useState([]);
  const isOngoing = game.board.includes(null);

  function calculateWinner(gamestate){
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    let board = gamestate.board;
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinnerArray([a,b,c]);
        return;
      }
    }
    setWinnerArray([]);
  };

  const makeMove = async (index) => {
    setErrorMessage("");

    if (!isOngoing || winnerArray.length > 0 || game.board[index]) {
      setErrorMessage("Invalid move. Please try again.");
      return;
    }

    //Online
    if(inLobby===true){
      let isNewGame = false;
      if(JSON.stringify(game.board)==JSON.stringify(newGame.board)){
        isNewGame = true;
      }
      onlineMakeMove(isNewGame, ("MOVE "+index))
    }
    //Singleplayer
    else{
      const updatedBoard = [...game.board]
      updatedBoard[index] = game.nextToken;

      const updatedGame = {
        board: updatedBoard,
        nextToken: game.nextToken === "X" ? "O" : "X",
      };
      setGame(updatedGame);
      calculateWinner(updatedGame);
    }
  };

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
    setErrorMessage("");
    setGame(newGame);
    setWinnerArray([]);
  }

  const loadGame = async (game) => {
    setGame(game);
    calculateWinner(game);
  }
  
  useImperativeHandle(ref, () => ({
    loadGame:loadGame,
    localResetGame:localResetGame
  }));
  
  return (
    <div className={styles.appContainer}>
      <h1 className = {styles.gameMode}>{
        !inLobby
        ? 'Singleplayer':
        `Game ID: ${gameId}`
      }</h1>

      <div className = {styles.board}>
      {/*--------------------*/}
        {game.board.map((cell, index) => (
          <div
            key={index}
            style = {{color:
            `${game.board[index] == 'X' ? "#FFC20A"
            : game.board[index] == 'O' ? "#0C7BDC"
            : ''}`
            }}
            className={`color0 ${styles.cell}
              ${(winnerArray).includes(index)!==false ? `${styles.cellHighlight}`
              : (!isOngoing && !winnerArray.includes(null)) ? `${styles.cellFailure}` 
              : ''}
              
              ${sendingAction ? styles.loadingCursor
              : ''}`
            }
            onClick={() => makeMove(index)}
          >
            {cell}
          </div>
        ))}
      </div>
      <div style={{display:'flex', flex:'0 0 auto', flexDirection:'column'}}>
        <p className={styles.token}>
          {winnerArray.length > 0
            ? `Token ${game.board[winnerArray[0]]} wins!`:
            isOngoing ? `Current Token: ${game.nextToken}`:
            'Tie game!'}
        </p>
        <button className={`${styles.resetButton}
          ${sendingAction ? styles.loadingCursor
          : ''}`
          } 
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
});
TicTacToe.displayName = 'Offline TicTacToe';
export default TicTacToe;