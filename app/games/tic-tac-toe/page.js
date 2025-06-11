"use client"

import { useEffect, useState, useRef } from "react";
import styles from "./page.module.css";
import SlidingButton from "../../_components/slidingButton/page";
import { supabase } from '@/lib/supabase';

const TicTacToe = () => {
  const channelName = "tic-tac-toe"
  const [errorMessage, setErrorMessage] = useState("");
  const [myToken, setMyToken] = useState(null);

  const [game, setGame] = useState({
    board: Array(9).fill(null),
    currentToken: "X",
  });

  useEffect(() => {
    supabase
      .channel('TicTacToe Updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'TicTacToe' }, payload => {
        const formatedPayload = {
          board: payload.new.boardState,
          currentToken: payload.new.nextToken,
        };
        //console.log(payload.new);
        //console.log(formatedPayload);
        setGame(formatedPayload);
        /*if (payload.id === parseInt(user_id)) {
          setGame(payload.board)
        }*/
      })
      .subscribe();
  }, []);
  
  const calculateWinner = (squares) => {
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

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        winnerArray = new Array(a,b,c);
        return squares[a];
      }
    }
    return null;
  };


  const makeMove = async (index) => {
    const squares = [...game.board];
    if(myToken===null){
      setMyToken(game.currentToken);
    }
    else if(myToken!=game.currentToken){
      setErrorMessage("It's not your turn!");
      return;
    }
    if (calculateWinner(squares) || squares[index]) {
      setErrorMessage("Invalid move. Please try again.");
      return;
    }

    squares[index] = game.currentToken;

    const updatedGame = {
      ...game,
      board: squares,
      currentToken: game.currentToken === "X" ? "O" : "X",
    };
    //await api response & set login warning based on result
  };

  const resetGame = async () => {
    const newGame = {
      board: Array(9).fill(null),
      currentToken: "X",
    };
    //await api response & set login warning based on result
  };
  
  let winnerArray = new Array(3);
  const isTied = game.board.includes(null)
  const winner = calculateWinner(game.board);
  return (
    <main
      className={styles.body}
    >
      <div className={styles.appContainer}>
        <h1 className = {styles.h1}>
          Tic Tac Toe
        </h1>
        <div className = {styles.board}>
          {game.board.map((cell, index) => (
            <div
              key={index}
              className={(winnerArray).includes(index)!==false ? [styles.cell, styles.cellHighlight].join(" ") : !isTied ? [styles.cell, styles.cellFailure].join(" ") : styles.cell}
              onClick={() => makeMove(index)}
            >
              {cell}
            </div>
          ))}
        </div>
        <p className={styles.currentToken}>
          {winner
            ? `Player ${winner} wins!`:
            isTied ? `Current Player: ${game.currentToken}`:
            'Tie game!'}
            
        </p>
        <SlidingButton />
        <button className={styles.resetButton} onClick={resetGame}>
          Reset Game
        </button>
        {errorMessage && (
          <p className={styles.errorMessage}>{errorMessage}</p>
        )}
      </div>
    </main>
  );
};

export default TicTacToe;