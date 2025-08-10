
"use client"
import styles from "./page.module.css";

import {useState, useEffect} from "react";
import { createClient } from '@/lib/supabase/client';
import {upsertSupabaseGame, upsertSupabaseGamePlayers} from '@/app/_components/games/_supabaseEdgeCaller';

import {Sidebar} from '@/app/_components/games/sidebar/page';
import {PlayerDisplay} from '@/app/_components/games/playerDisplay/page';

const ConnectFour = () => {
    const tableName = "ConnectFour";

    const [gameId, setGameId] = useState(null);
    const [gameKey, setGameKey] = useState(null);

    const [inLobby, setInLobby] = useState(false);  //Boolean to check for success in joining a lobby

    const [userId, setUserId] = useState(null);
    const [playerIds, setPlayerIds] = useState([]);
    const [playerNames, setPlayerNames] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(null);
    const [maxPlayers, setMaxPlayers] = useState(null);

    const [winnerArray, setWinnerArray] = useState([]);

    const [errorMessage, setErrorMessage] = useState("");
    const newGame = { //7 collumns by 6 rows
        board: Array(7).fill(null).map(() => Array(6).fill(null)),
        nextToken: "X",

        //Allows for less computation in checkWinner
        row:-1,
        col:-1
    };
    //Handle: if id =  null, you're doing singleplayer
    const [game, setGame] = useState({
        board:newGame.board,
        nextToken:newGame.nextToken,

        row:newGame.row,
        col:newGame.col
    });

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
            setGame(data.game);
            calculateWinner(data.game);
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
        //Checks if the game exists and refuses to proceed if it does not.
        if (await initGameState() == false){
          setGameId(null);
          return;
        }
        //Subscribe the game's channel, inform client of table updates (and joins/leaves)
        channel = createClient().channel(`${gameId}`)
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
          createClient().removeChannel(channel)
        }
        if(inLobbyScoped){
          upsertSupabaseGamePlayers(tableName, gameId, gameKey,"LEAVE");
          setInLobby(false);
        }
        resetGame();
      }
    }
  }, [gameId]);

    const resetGame = async () => {
        setErrorMessage("");
        setWinnerArray([]);
        if(inLobby===true){
        //await api response & set login warning based on result
            try{
                upsertSupabaseGame("PATCH", tableName, gameId, gameKey, "RESET");
            }
            catch{
                console.log("Client unable to send event. Try refreshing your page.")
            }
        }
        else{
            setGame(newGame);
        }
    }


    //winning array contains ALL positions with connections of 4 or greater, positions may be unordered or repeated.

    const calculateWinner = (funcGame) => {
        const board = funcGame.board;
        const col = funcGame.col;
        const row = funcGame.row;
        const nextToken = funcGame.nextToken=='X'?'O':'X'; //funcGame.token is the token that WILL be placed. We need to check what WAS placed.
        //console.log("Checking for ",token," win.");
        const flood = (curCol, curRow, incCol, incRow) =>{
            //Skip the starting token
            curCol+=incCol;
            curRow+=incRow;

            let connectedPositions = [];
            while(board[curCol] && board[curCol][curRow]==nextToken){
                connectedPositions.push([curCol,curRow]);
                curCol+=incCol;
                curRow+=incRow;
            }
            return connectedPositions;
        }
        
        let start = [col,row];
        let lines = new Array(4);
        let localWinnerArray = winnerArray;
        lines[0] = [start].concat(flood(col,row, 1, 0)).concat(flood(col,row,-1,0));
        lines[1] = [start].concat(flood(col,row, 0, 1)).concat(flood(col,row,0,-1));
        lines[2] = [start].concat(flood(col,row, 1, 1)).concat(flood(col,row, -1, -1));
        lines[3] = [start].concat(flood(col,row, 1, -1)).concat(flood(col,row, -1, 1));
        for (const line of lines){
            if(line.length >= 4){
                localWinnerArray = localWinnerArray.concat(line);
            }
        }
        setWinnerArray(localWinnerArray);
        //return board[col][row];
    };


    const makeMove = async (index) => {
        setErrorMessage("");
  
        let rowResult = -1;
        const newBoard = game.board.map(innerArray => [...innerArray]);
        let funcToken = game.nextToken;

        for(let i=newBoard[index].length-1; i>=0; --i){
            if(!newBoard[index][i]){
                newBoard[index][i] = funcToken;
                rowResult = i;
                break;
            }
        }
        const updatedGame = {
            ...game,
            board: newBoard,
            nextToken: funcToken === "X" ? "O" : "X",
        };

        if (!isOngoing || rowResult == -1) {
            setErrorMessage("Invalid move. Please try again.");
            return;
        }

        //Multiplayer
        if(inLobby===true){
            if(userId!=playerIds[currentPlayerIndex] && JSON.stringify(game.board)!=JSON.stringify(newGame.board)){
                setErrorMessage("It's not your turn! There are "+playerIds.length+" players in this game.");
                return;
            }
            //await api response & set login warning based on result
            try{
                upsertSupabaseGame("PATCH", tableName, gameId, gameKey, ("MOVE "+index));
            }
            catch{
                console.log("Client unable to send event. Try refreshing your page.")
            }
        }
        else{
            setGame(updatedGame);
            const calcGame = {
                board: updatedGame.board,
                col: index,
                row: rowResult,
                nextToken: updatedGame.nextToken
            }
            calculateWinner(calcGame);
        }
    };

    //temp - doesn't account for filled boards.
    const isOngoing = winnerArray.length == 0;
    const winner = !isOngoing && game.board[winnerArray[0][0]][winnerArray[0][1]];

    return (
        <main style={{display:"flex", flexDirection:"row"}}>
            {/*main holds the sidebar and main-page flex boxes*/}


            {/*Game-create and game-join caller. Does not hold the subscriber TO the game, only the create and join logic.*/}
            <Sidebar tableName={tableName} setGameId={setGameId} setGameKey={setGameKey} setInLobby={setInLobby} inLobby={inLobby}/>

            {/*-------------------------------------------------------------------*/}


            <div className={`color1 ${styles.primaryContainer}`}>
                    <div className={styles.subAppContainer}>
                        {errorMessage && (
                        <p className={styles.errorMessage}>{errorMessage}</p>
                        )}
                    </div>
                    <div className={styles.appContainer}>
                    <div style={{display:"flex", width:"100%", alignContent:"center", justifyContent:"center"}}>
                        <h1 className = {styles.gameMode}>{
                            !inLobby
                            ? 'Singleplayer':
                            `Game ID: ${gameId}`
                        }</h1>
                    </div>
                    <div className = {styles.board}>
                        {/*--------------------*/}
                        {game.board.map((col, colIndex) => (
                            <div
                                key={colIndex}
                                className = {styles.column}
                            >
                            {col.map((cell, cellIndex) => (
                                <div
                                    key={cellIndex}
                                    //className = {styles.cell}
                                    className = {`color0
                                        ${game.board[colIndex][cellIndex] == null ? styles.cell
                                        : (game.board[colIndex][cellIndex] == 'X') ? `${styles.cell} ${styles.tokenA}`
                                        : `${styles.cell} ${styles.tokenB}`}
                                    
                                        ${winnerArray.some((arr) => JSON.stringify(arr) == JSON.stringify([colIndex,cellIndex])) ? `${styles.cellHighlight}`
                                        : (!isOngoing && winnerArray.length == 0) ? `${styles.cellFailure}`
                                        : ''}`
                                    }
                                    onClick={() => makeMove(colIndex)}
                                >
                                {cell}
                                </div>
                            ))}
                            </div>
                        ))}
                    </div>
                    <p className={styles.token}>
                        {winner
                        ? `Token ${winner} wins!`:
                        isOngoing ? `Current Token: ${game.nextToken}`:
                        'Tie game!'}
                    </p>
                    <button className={styles.resetButton} onClick={resetGame}>
                        Reset Game
                    </button>
                </div>
                <div className={styles.subAppContainer}>
                    <PlayerDisplay tableName={tableName} gameId={gameId} playerNames={playerNames} gameKey={gameKey} thisPlayerIndex={playerIds.indexOf(userId)} currentPlayerIndex={currentPlayerIndex} maxPlayers = {maxPlayers} hide={!inLobby}/>
                </div>
            </div>
        </main>
    );









}
export default ConnectFour