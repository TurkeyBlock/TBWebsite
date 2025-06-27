"use client"

import { useEffect, useState} from "react";
import styles from "./page.module.css";
import { createClient } from '@/lib/supabase/client';
import {callSupabase} from '@/app/_components/games/_supabaseEdgeCaller';
import {Sidebar} from '@/app/_components/games/sidebar/page';

const TicTacToe = () => {
  const tableName = "TicTacToe";

  const [gameId, setGameId] = useState(null);
  const [gameKey, setGameKey] = useState(null);

  const [inLobby, setInLobby] = useState(false);  //Boolean to check for success in joining a lobby
  //const [isLocked, setIsLocked] = useState(false); //Display boolean for if the lobby is locked

  const [errorMessage, setErrorMessage] = useState("");
  const [myToken, setMyToken] = useState(null);

  const newGame = {
    board: Array(9).fill(null),
    currentToken: "X",
  };
  //Handle: if id =  null, you're doing singleplayer
  const [game, setGame] = useState({
    board:newGame.board,
    currentToken:newGame.currentToken
  });
 

  //Format the recieved-from-subscription payload to client-readable state 
  function formatPayload(newBoard,nextToken){
    const data = {
      board: newBoard,
      currentToken: nextToken,
    };
    return data;
  };
  
  //Game channel subscription
  useEffect(() => {
    //Induce singleplayer
    if(gameId!=null){
      //setSidebar(false);
      //Boot the client-side-render of the game, fetched from database
      async function initGameState() {
        const payload = await callSupabase("GET", tableName, gameId, null, null);
        if(payload.data==undefined){
          setErrorMessage("Lobby not found")
          return;
        }
        setGame(formatPayload(payload.data.board, payload.data.nextToken));
        setMyToken(null);
      };
      initGameState();
      setInLobby(true);

      //Subscribe the game's channel, inform client of table updates (and joins/leaves)
      const channel = createClient()
        .channel(`${gameId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName, filter:`id=eq.${gameId}`}, 
          (payload) => {
            const formatedPayload = formatPayload(payload.new.board, payload.new.nextToken)
            setGame(formatedPayload)
            if(formatedPayload.board.toString()==newGame.board.toString()){
              setMyToken(null);
            }
            setErrorMessage("");
          }
        )/*
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('leave', key, leftPresences)
        })*/
        .subscribe();
      return () => {
        createClient().removeChannel(channel)
      }
    }
    else{
      resetGame();
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
    setErrorMessage("");
    const squares = [...game.board];

    //Setting a constant isn't guaranteed to sync, so editing it could fail to be reflected in the function.
    let funcToken = myToken;
    if(funcToken==null){
      setMyToken(game.currentToken);
      funcToken = game.currentToken;
      console.log(funcToken);
    }
    else if(funcToken!=game.currentToken){
      setErrorMessage("It's not your turn! (Your Token = "+funcToken+")");
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
    if(inLobby===true){
      //await api response & set login warning based on result
      try{
        callSupabase("PATCH", tableName, gameId, ("MOVE "+funcToken+" "+index), gameKey);
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
    setErrorMessage("");
    if(inLobby===true){
      //await api response & set login warning based on result
      try{
        callSupabase("PATCH", tableName, gameId, "RESET", null);
        setMyToken(null)
      }
      catch{
        console.log("Client unable to send event. Try refreshing your page.")
      }
    }
    else{
      setGame(newGame);
      setMyToken(null);
    }
  };
  
  let winnerArray = new Array(3);
  const isOngoing = game.board.includes(null)
  const winner = calculateWinner(game.board);
  return (
    <main style={{display:"flex", flexDirection:"row"}}>
      {/*main holds the sidebar and main-page flex boxes*/}


      {/*Game-create and game-join caller. Does not hold the subscriber TO the game, only the create and join logic.*/}
      <Sidebar tableName={tableName} setGameId={setGameId} setGameKey={setGameKey} setInLobby={setInLobby} inLobby={inLobby}/>

      {/*-------------------------------------------------------------------*/}


      <div className={styles.body} style={{padding: "0px", flex:"1"}}>
        {/*main page flex box*/}
        <div className={styles.appContainer}>
          <h1 style={{fontSize:"3em", marginBottom:'2vw'}}>{
            !inLobby
            ? 'Singleplayer':
            false
            ? `[X] Game ID: ${gameId}`
            : `[*] Game ID: ${gameId}`
          }</h1>
          <div className = {styles.board}>

          {/*--------------------*/}
            {game.board.map((cell, index) => (
              <div
                key={index}
                className={(winnerArray).includes(index)!==false ? [styles.cell, styles.cellHighlight].join(" ") : (!isOngoing && winnerArray[0]==null) ? [styles.cell, styles.cellFailure].join(" ") : styles.cell}
                onClick={() => makeMove(index)}
              >
                {cell}
              </div>
            ))}
          </div>
          <p className={styles.currentToken}>
            {winner
              ? `Player ${winner} wins!`:
              isOngoing ? `Current Player: ${game.currentToken}`:
              'Tie game!'}
              
          </p>
          
          <button className={styles.resetButton} onClick={resetGame}>
            Reset Game
          </button>
          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}
          
        </div>
      </div>
    </main>
  );
};

export default TicTacToe;