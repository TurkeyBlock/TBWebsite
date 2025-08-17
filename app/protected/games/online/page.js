"use client"

import styles from "./page.module.css";

import dynamic from 'next/dynamic';
import { useSearchParams } from "next/navigation";
import {useState, useEffect, useRef} from "react";
import { createClient } from '@/lib/supabase/client';
import {upsertSupabaseGame, upsertSupabaseGamePlayers} from '@/app/_components/games/_supabaseEdgeCaller';

import {Sidebar} from '@/app/_components/games/sidebar/page';
import {PlayerDisplay} from '@/app/_components/games/playerDisplay/page';

const TicTacToe = dynamic(() => import('./_tic-tac-toe/page'), {
loading: () => <p>Loading TicTacToe</p>,
  ssr: false,
});

const ConnectFour= dynamic(() => import('./_connect-four/page'), {
loading: () => <p>Loading ConnectFour</p>,
  ssr: false,
});

export default function OnlineGames() {
  const searchParams = useSearchParams();
  const tableName = searchParams.get("game");

  const childRef = useRef();

  const [gameId, setGameId] = useState(null);
  const [gameKey, setGameKey] = useState(null);

  const [inLobby, setInLobby] = useState(false);  //Boolean to check for success in joining a lobby

  const [userId, setUserId] = useState(null);
  const [playerIds, setPlayerIds] = useState([]);
  const [playerNames, setPlayerNames] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  function handleSubscriptionAction(type, game = null){
    if(childRef.current){
      if(type==="load" && childRef.current.loadGame){
        childRef.current.loadGame(game); //Calls the exposed child function (should be dynamic, game specific)
      }
      if(type==="reset" && childRef.current.localResetGame){
        childRef.current.localResetGame(); //Calls the exposed child function (should be dynamic, game specific)
      }
    }
  }


  useEffect(() => {
    let channel;

    async function getUserId(){
      const {data:supabaseSession} = await createClient().auth.getSession();
      if(supabaseSession.session){
        setUserId(supabaseSession.session.user.id);
      }
    }
    getUserId();
    let inLobbyScoped = inLobby;
    
    //By changing the game Id, user attempts to join channel.
    //They are considered 'in lobby' while that channel is SUBSCRIBED.
    if(gameId!=null){

      //Boot the client-side-render of the game, fetched from database
      async function initGameState() {
        //const payload = await getSupabaseGame(tableName, gameId);
        try{
          const { data } = await createClient().from(tableName).select('name, game, public').eq('id', gameId).single();
          if(data == null){
            return false;
          }
          //JSON contains board and token
          handleSubscriptionAction("load", data.game)
        } catch {
          console.log("InitGameState function exploded into at least six tiny pieces.");
          return false;
        }
        return true;
      };

      async function initPlayerState() {
        //Payload is recieved to avoid race conditions between sending this update and recieving it... 
        // ...on the *possibly active* channel.
        const payload = await upsertSupabaseGamePlayers(tableName, gameId, gameKey,"JOIN")
        setPlayerIds(payload.playerIds);
        setPlayerNames(payload.playerNames);
        setCurrentPlayerIndex(payload.currentPlayerIndex);
        setMaxPlayers(payload.maxPlayers);
      }
      
      async function initSubscription() {
        //Checks if the game exists and initializes it if so.
        if (await initGameState() == false){
          setGameId(null);
          return;
        }
        //Subscribe the game's channel, inform client of table updates (and joins/leaves)
        channel = createClient().channel(`${gameId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName, filter:`id=eq.${gameId}`}, 
        (payload) => {
          const returnedGame = payload.new.game;
          handleSubscriptionAction("load", returnedGame)
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
          if(status == 'SUBSCRIBED'){
            initPlayerState();
            setInLobby(true);
            inLobbyScoped = true;
          }
        });
      }
      initSubscription();

      return () => {
        if(channel){
          let allChannels = createClient().getChannels()
          console.log(allChannels);
          createClient().removeChannel(channel).then(() =>{
            allChannels = createClient().getChannels()
            console.log(allChannels);
          });
        }
        if(inLobbyScoped){
          upsertSupabaseGamePlayers(tableName, gameId, gameKey,"LEAVE");
          setInLobby(false);
        }
        handleSubscriptionAction("reset", null)
      }
    }
  }, [gameId]);

  //Accepts the CLIENT override on if this is a new game and so if turn order is undecided.
  function onlineMakeMove(isNewGame, moveString){
    if(userId!=playerIds[currentPlayerIndex] && !isNewGame){
        setErrorMessage("It's not your turn! There are "+playerIds.length+" players in this game."); //Non accurate
        return;
      }
      //await api response & set login warning based on result
      try{
        console.log("Sending supabase patch call");
        upsertSupabaseGame("PATCH", tableName, gameId, gameKey, moveString);
      }
      catch{
        console.log("Client unable to send event. Try refreshing your page.")
      }
  }

  function onlineResetGame(){
    try{
      console.log("Sending supabase reset call");
      upsertSupabaseGame("PATCH", tableName, gameId, gameKey, "RESET");
    }
    catch{
      setErrorMessage("Client unable to send event. Try refreshing your page.");
    }
  }

    
  return(
    <main style={{display:"flex", flexDirection:"row"}}>
      {/*main holds the sidebar and main-page flex boxes*/}

      {/*Game-create and game-join caller. Does not hold the subscriber TO the game, only the create and join logic.*/}
      <Sidebar tableName={tableName} setGameId={setGameId} setGameKey={setGameKey} inLobby={inLobby}/>
      
      <div className={`color1 ${styles.primaryContainer}`}>
        <div className={styles.subAppContainer}>
          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}
        </div>
        {tableName === "TicTacToe" && (<TicTacToe ref = {childRef} inLobby = {inLobby} gameId = {gameId} onlineMakeMove = {onlineMakeMove} onlineResetGame = {onlineResetGame} setErrorMessage = {setErrorMessage} />)}
        {tableName === "ConnectFour" && (<ConnectFour ref = {childRef} inLobby = {inLobby} gameId = {gameId} onlineMakeMove = {onlineMakeMove} onlineResetGame = {onlineResetGame} setErrorMessage = {setErrorMessage} />)}
        <div className={styles.subAppContainer}>
          <PlayerDisplay tableName={tableName} gameId={gameId} playerNames={playerNames} gameKey={gameKey} thisPlayerIndex={playerIds.indexOf(userId)} currentPlayerIndex={currentPlayerIndex} maxPlayers = {maxPlayers} hide={!inLobby}/>
        </div>
      </div>
    </main>
  )
}