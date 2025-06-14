"use client"

import { useEffect, useState} from "react";
import styles from "./page.module.css";
//import SlidingButton from '../../../_components/slidingButton'
import { supabase } from '@/lib/supabase';
import {sendEvent, fetchData} from "../_supaHandler";
import TextInput from "../../../_components/textInput/page";

const TicTacToe = () => {
  const tableName = "TicTacToe";

  const [gameId, setGameId] = useState(null);
  const [inputText, setInputText] = useState("");

  //Handles submission to lobby-input form.
  function handleSubmit(event){
    event.preventDefault(); //Do not refresh the page.
    console.log(event);
    if(inputText=="")
      return;
    setGameId(inputText);
  }

  const [errorMessage, setErrorMessage] = useState("");
  const [myToken, setMyToken] = useState(null);



  //Handle: if id =  null, you're doing singleplayer
  const [game, setGame] = useState({
    id: null,
    board: Array(9).fill(null),
    currentToken: "X",
  });

  //Format the recieved-from-subscription payload to client-readable state 
  function formatPayload(newBoard,nextToken){
    const data = {
      board: newBoard,
      currentToken: nextToken,
    };
    return data;
  };

  //Format a request for the server function to read, authorize, and broadcast
  function createReq(updatedGame){
    const req = {
      table: tableName,
      id: gameId,
      body: updatedGame
    }
    return req;
  };

  async function initGameState() {
    const payload = await fetchData(tableName, gameId);
    console.log(payload);
    setGame(formatPayload(payload.boardState, payload.nextToken))
    setMyToken(null);
  };

  //Game channel subscription
  useEffect(() => {
    //Induce singleplayer
    if(gameId!=null){

      initGameState();
        const channel = supabase
          .channel(`${gameId}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName, filter:`id=eq.${gameId}`}, 
            (payload) => {
              const formatedPayload = formatPayload(payload.new.boardState, payload.new.nextToken)
              setGame(formatedPayload)
              setErrorMessage("")
            }
          )
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('join', key, newPresences)
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('leave', key, leftPresences)
          })
          .subscribe();
          console.log(channel);
      return () => {
        supabase.removeChannel(channel)
      }

    }
  }, [gameId]);
  
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
        winnerArray = [a,b,c];
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
      setErrorMessage("It's not your turn! (Your Token = "+myToken+")");
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
    if(gameId!=null){
      //await api response & set login warning based on result
      try{
        const req = createReq(updatedGame);
        //console.log(await 
          sendEvent(req)
        //);
      }
      catch{
        console.log("Client unable to send event. Try refreshing your page.")
      }
    }
    else{
      setGame(updatedGame);
      setMyToken(updatedGame.currentToken);
    }
  };

  const resetGame = async () => {
    const newGame = {
      board: Array(9).fill(null),
      currentToken: "X",
    };
    if(gameId!=null){
      //await api response & set login warning based on result
      try{
        const req = createReq(newGame);
        sendEvent(req);
        setMyToken(null)
      }
      catch{
        console.log("Client unable to send event. Try refreshing your page.")
      }
    }
    else{
      setGame(newGame);
    }
  };
  
  let winnerArray = new Array(3);
  const isTied = game.board.includes(null)
  const winner = calculateWinner(game.board);
  return (
    <main
      className={styles.body}
    >
      <TextInput inputText={inputText} setInputText={setInputText} buttonLabel="Submit" boxLabel="Lobby Code:" handleSubmit={ handleSubmit }/>
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