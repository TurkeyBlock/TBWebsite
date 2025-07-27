"use client"
import styles from "./page.module.css";

import { useEffect, useState} from "react";
import { createClient } from '@/lib/supabase/client';
import {callSupabase} from '@/app/_components/games/_supabaseEdgeCaller';
import {Sidebar} from '@/app/_components/games/sidebar/page';

const TicTacToe = () => {
  const tableName = "TicTacToe";

  const [gameId, setGameId] = useState(null);
  const [gameKey, setGameKey] = useState(null);

  const [inLobby, setInLobby] = useState(false);  //Boolean to check for success in joining a lobby
  //const [isLocked, setIsLocked] = useState(false); //Display boolean for if the lobby is locked

  const [userId, setUserId] = useState(null);
  const [playerIds, setPlayerIds] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [winnerArray, setWinnerArray] = useState([]);

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

    async function getUserId(){
      const supabase = await createClient();
      const {data:supabaseSession} = await supabase.auth.getSession();
      setUserId(supabaseSession.session.user.id);
    }
    getUserId();

    //Induce singleplayer
    if(gameId!=null){
      //setSidebar(false);
      //Boot the client-side-render of the game, fetched from database
      async function initGameState() {
        const payload = await callSupabase("GET", tableName, gameId, null, null);
        if(payload.data==undefined){
          setErrorMessage("Lobby not found")
          setGameId(null);
          return;
        }
        setGame(formatPayload(payload.data.board, payload.data.nextToken));
        calculateWinner(payload.data.board);
      };
      initGameState();
      setInLobby(true);

      //Subscribe the game's channel, inform client of table updates (and joins/leaves)
      callSupabase("PlayerTracking", tableName, gameId, "JOIN", gameKey);
      const channel = createClient()
        .channel(`${gameId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName, filter:`id=eq.${gameId}`}, 
          (payload) => {
            const formatedPayload = formatPayload(payload.new.board, payload.new.nextToken);
            setGame(formatedPayload);
            calculateWinner(payload.new.board);
            setErrorMessage("");
          }
        )
        .on('postgres_changes', {event: 'UPDATE', schema: 'public', table: 'GamePlayers', filter: `id=eq.${gameId}`},
          (payload) => {
            console.log(payload);
            setPlayerIds(payload.new.playerIds);
            setCurrentPlayerIndex(payload.new.currentPlayerIndex);
          }
        )
        /*
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('leave', key, leftPresences)
        })*/
        .subscribe();
      return () => {
        callSupabase("PlayerTracking", tableName, gameId, "LEAVE", gameKey);
        createClient().removeChannel(channel)
      }
    }
    else{
      resetGame();
    }
  }, [gameId]);
  
  function calculateWinner(squares){
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

    //Multiplayer
    if(inLobby===true){
      if(userId!=playerIds[currentPlayerIndex] && JSON.stringify(game.board)!=JSON.stringify(newGame.board)){
        setErrorMessage("It's not your turn! There are "+playerIds.length+" players in this game."); //Non accurate
        return;
      }
      //await api response & set login warning based on result
      try{
        console.log("Sending supabase call");
        callSupabase("PATCH", tableName, gameId, ("MOVE "+index), gameKey);
      }
      catch{
        console.log("Client unable to send event. Try refreshing your page.")
      }
    }
    //Singleplayer
    else{
      const squares = [...game.board]
      squares[index] = game.currentToken;

      const updatedGame = {
        board: squares,
        currentToken: game.currentToken === "X" ? "O" : "X",
      };
      setGame(updatedGame);
      calculateWinner(squares);
    }
  };

  const resetGame = async () => {
    setErrorMessage("");
    if(inLobby===true){
      //await api response & set login warning based on result
      try{
        console.log("Sending supabase call");
        callSupabase("PATCH", tableName, gameId, "RESET", gameKey);
      }
      catch{
        console.log("Client unable to send event. Try refreshing your page.")
      }
    }
    else{
      setGame(newGame);
      setWinnerArray([]);
    }
  };

  const isOngoing = game.board.includes(null)
  return (
    <main style={{display:"flex", flexDirection:"row"}}>
      {/*main holds the sidebar and main-page flex boxes*/}


      {/*Game-create and game-join caller. Does not hold the subscriber TO the game, only the create and join logic.*/}
      <Sidebar tableName={tableName} setGameId={setGameId} setGameKey={setGameKey} setInLobby={setInLobby} inLobby={inLobby}/>

      {/*-------------------------------------------------------------------*/}


      <div className={styles.appContainer} style={{padding: "0px", flexGrow:"1"}}>
        {/*main page flex box*/}
        <div className={styles.appContainer}>
          <h1 style={{fontSize:"8vmin", marginBottom:'2vmin'}}>{
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
                className={(winnerArray).includes(index)!==false ? [styles.cell, styles.cellHighlight].join(" ")
                : (!isOngoing && !winnerArray.includes(null)) ? [styles.cell, styles.cellFailure].join(" ") 
                : styles.cell}
                onClick={() => makeMove(index)}
              >
                {cell}
              </div>
            ))}
          </div>
          <p className={styles.currentToken}>
            {winnerArray.length > 0
              ? `Player ${game.board[winnerArray[0]]} wins!`:
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