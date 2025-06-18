"use client"

import { useEffect, useState} from "react";
import styles from "./page.module.css";
//import SlidingButton from '../../../_components/slidingButton'
import { supabase } from '@/lib/supabase';
import {callSupabase} from '../_supabaseEdgeCaller'
import TextInput from "../../../_components/textInput/page";

const TicTacToe = () => {
  const tableName = "TicTacToe";

  const [gameId, setGameId] = useState(null);
  const [inLobby, setInLobby] = useState(false);  //Boolean to check for success in joining a lobby
  const [inputText, setInputText] = useState("");  //Form input for lobby id.

  //Handles submission to lobby-input form.
  function handleSubmit(event){
    if(inLobby===true){
      console.log("Attempted to join a lobby while already in one - reloading page.")
    }
    else{
      event.preventDefault(); //Do not refresh the page UNLESS client was previously subscribed to a channel
    }

    setGameId(inputText);
  }

  const [errorMessage, setErrorMessage] = useState("");
  const [myToken, setMyToken] = useState(null);
  const [sidebar, setSidebar] = useState(true);
  function toggleSidebar(){
    setSidebar(sidebar?false:true);
  }


  const newGame = {
    board: Array(9).fill(null),
    currentToken: "X",
  };
  //Handle: if id =  null, you're doing singleplayer
  const [game, setGame] = useState({
    id:null,
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

  async function submitGameCreate(){
    if(!inLobby){
      const data = await callSupabase("POST", tableName, gameId, null, null);

      //This isn't working to retrieve game ID.
      //console.log(data);
      setGameId(data.id);
      
    }
  }
  
  //Game channel subscription
  useEffect(() => {
    //Induce singleplayer
    if(gameId!=null){
      setSidebar(false);
      //Boot the client-side-render of the game, fetched from database
      async function initGameState() {
        const payload = await callSupabase("GET", tableName, gameId, null, null);
        console.log(payload);
        if(payload==undefined){
          setErrorMessage("Lobby not found")
          return;
        }
        setGame(formatPayload(payload.boardState, payload.nextToken))
        setMyToken(null);
      };
      initGameState();
      setInLobby(true);

      //Subscribe the game's channel, inform client of table updates (and joins/leaves)
      const channel = supabase
        .channel(`${gameId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName, filter:`id=eq.${gameId}`}, 
          (payload) => {
            const formatedPayload = formatPayload(payload.new.boardState, payload.new.nextToken)
            setGame(formatedPayload)
            if(formatedPayload.board.toString()==newGame.board.toString()){
              setMyToken(null);
            }
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
    setErrorMessage("");
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
    if(inLobby===true){
      //await api response & set login warning based on result
      try{
        callSupabase("PATCH", tableName, gameId, ("MOVE "+myToken+" "+index), null);
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
  const isTied = game.board.includes(null)
  const winner = calculateWinner(game.board);
  return (
    <main style={{display:"flex", flexDirection:"row",backgroundColor:"black"}}>

      <div className="sidebar" style={{display:"flex", flexDirection:"row", backgroundColor:"darkgrey"}}>
        <div className="sidebarContents" style={{flex:"1", display:sidebar==true?"flex":"none", flexDirection:"column", alignItems:"start"}}>
          <TextInput boxLabel="Lobby Code:" inputText={inputText} buttonLabel="Submit" setInputText={setInputText} handleSubmit={ handleSubmit }/>
          <span style={{height:"2px",width:"100%", backgroundColor:"lightGrey"}}></span>
          <div className="secondBox" style={{padding:"5%"}}>
            <button className={styles.resetButton} onClick={submitGameCreate}></button>
            <li>Open lobbies placeholder</li>
          </div>
        </div>
        <span className="sidebarEdge" style={{backgroundColor:"grey"}}>
          <button style={{padding:"3px"}} onClick={toggleSidebar}>{sidebar==true?"<<":">>"}</button>
        </span>
      </div>
      
      <div style={{padding: "0px", flex:"1"}}>
        <div
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
            
            <button className={styles.resetButton} onClick={resetGame}>
              Reset Game
            </button>
            {errorMessage && (
              <p className={styles.errorMessage}>{errorMessage}</p>
            )}
            
          </div>
        </div>
      </div>
    </main>
  );
};

export default TicTacToe;