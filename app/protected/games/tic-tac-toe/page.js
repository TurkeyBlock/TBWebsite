"use client"
import styles from "./page.module.css";

import {useState, useEffect} from "react";
import { createClient } from '@/lib/supabase/client';
import {getSupabaseGame, upsertSupabaseGame, upsertSupabaseGamePlayers} from '@/app/_components/games/_supabaseEdgeCaller';

import {Sidebar} from '@/app/_components/games/sidebar/page';
import {PlayerDisplay} from '@/app/_components/games/playerDisplay/page';

const TicTacToe = () => {
  const tableName = "TicTacToe";

  const [gameId, setGameId] = useState(null);
  const [gameKey, setGameKey] = useState(null);

  const [inLobby, setInLobby] = useState(false);  //Boolean to check for success in joining a lobby
  //const [isLocked, setIsLocked] = useState(false); //Display boolean for if the lobby is locked

  const [userId, setUserId] = useState(null);
  const [playerIds, setPlayerIds] = useState([]);
  const [playerNames, setPlayerNames] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [winnerArray, setWinnerArray] = useState([]);

  const newGame = {
    board: Array(9).fill(null),
    nextToken: "X",
  };
  //Handle: if id =  null, you're doing singleplayer
  const [game, setGame] = useState(newGame);
  
  useEffect(() => {
    setInLobby(false);
    async function getUserId(){
      const {data:supabaseSession} = await createClient().auth.getSession();
      if(supabaseSession.session){
          setUserId(supabaseSession.session.user.id);
      }
    }
    getUserId();
    //Induce singleplayer
    if(gameId!=null){
      //Boot the client-side-render of the game, fetched from database
      async function initGameState() {
          const payload = await getSupabaseGame(tableName, gameId);
          const game = payload.game;
          if(game==undefined){
              setErrorMessage("Lobby not found")
              setInLobby(false);
              setGameId(null);
              return;
          }
          //TicTacToe JSON contains board and token
          setGame(game);
          calculateWinner(game);
      };
      initGameState();
      setInLobby(true);

      //Subscribe the game's channel, inform client of table updates (and joins/leaves)
      const channel = createClient().channel(`${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName, filter:`id=eq.${gameId}`}, 
      (payload) => {
        const returnedGame = payload.new.game;
        setGame(returnedGame);
        calculateWinner(returnedGame);
        setErrorMessage("");
      })
      .on('postgres_changes', {event: 'UPDATE', schema: 'public', table: 'GamePlayers', filter: `id=eq.${gameId}`},
      (payload) => {
        setPlayerIds(payload.new.playerIds);
        setPlayerNames(payload.new.playerNames);
        setCurrentPlayerIndex(payload.new.currentPlayerIndex);
        setMaxPlayers(payload.new.maxPlayers);
      })
      //Monitoring connection & posting to the player list after confirming a connection was made
      .subscribe((status) => {
        console.log('subscribe_status, '+status);
      });

      async function initPlayerState() {
        //Payload is recieved to avoid race conditions between sending this update and recieving it 
        // on the *possibly active* channel.
        const payload = await upsertSupabaseGamePlayers(gameId, gameKey,"JOIN")
        setPlayerIds(payload.playerIds);
        setPlayerNames(payload.playerNames);
        setCurrentPlayerIndex(payload.currentPlayerIndex);
        setMaxPlayers(payload.maxPlayers);
      }
      initPlayerState();

      return () => {
        upsertSupabaseGamePlayers(gameId, gameKey,"LEAVE");
        createClient().removeChannel(channel)
      }
    }
    else{
      resetGame();
    }
  }, [gameId]);



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

    //Multiplayer
    if(inLobby===true){
      if(userId!=playerIds[currentPlayerIndex] && JSON.stringify(game.board)!=JSON.stringify(newGame.board)){
        setErrorMessage("It's not your turn! There are "+playerIds.length+" players in this game."); //Non accurate
        return;
      }
      //await api response & set login warning based on result
      try{
        console.log("Sending supabase patch call");
        upsertSupabaseGame("PATCH", tableName, gameId, gameKey, ("MOVE "+index));
      }
      catch{
        console.log("Client unable to send event. Try refreshing your page.")
      }
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
    setErrorMessage("");
    if(inLobby===true){
      //await api response & set login warning based on result
      try{
        console.log("Sending supabase reset call");
        upsertSupabaseGame("PATCH", tableName, gameId, gameKey, "RESET");
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
      <Sidebar setGameId={setGameId} setGameKey={setGameKey} setInLobby={setInLobby} inLobby={inLobby}/>
      
      <div className={`color1 ${styles.appContainer}`} style={{padding: "0px", flexGrow:"1"}}>
        {/*game page flex box*/}

        <div className={styles.appContainer}>
          <PlayerDisplay tableName={tableName} gameId={gameId} playerNames={playerNames} gameKey={gameKey} thisPlayerIndex={playerIds.indexOf(userId)} currentPlayerIndex={currentPlayerIndex} maxPlayers = {maxPlayers} hide={!inLobby}/>
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
                className={`color0 ${(winnerArray).includes(index)!==false ? `${styles.cell} ${styles.cellHighlight}`
                : (!isOngoing && !winnerArray.includes(null)) ? `${styles.cell} ${styles.cellFailure}` 
                : styles.cell}`}
                onClick={() => makeMove(index)}
              >
                {cell}
              </div>
            ))}
          </div>
          <div style={{display:'flex', flex:'0 0 auto', flexDirection:'column'}}>
            <p className={styles.nextToken}>
              {winnerArray.length > 0
                ? `Player ${game.board[winnerArray[0]]} wins!`:
                isOngoing ? `Current Player: ${game.nextToken}`:
                'Tie game!'}
            </p>
            <button className={styles.resetButton} onClick={resetGame}>
              Reset Game
            </button>
          </div>
          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default TicTacToe;