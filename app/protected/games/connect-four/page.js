
"use client"


import styles from "./page.module.css";
import "@/app/globals.css";

import { useEffect, useState} from "react";
import { createClient } from '@/lib/supabase/client'
import {callSupabase} from '@/app/_components/games/_supabaseEdgeCaller';
import {Sidebar} from '@/app/_components/games/sidebar/page';

const ConnectFour = () => {
    const tableName = "ConnectFour";

    const [gameId, setGameId] = useState(null);
    const [gameKey, setGameKey] = useState(null);

    const [inLobby, setInLobby] = useState(false);  //Boolean to check for success in joining a lobby
    //const [isLocked, setIsLocked] = useState(false); //Display boolean for if the lobby is locked

    const [winnerArray, setWinnerArray] = useState([]);

    const [errorMessage, setErrorMessage] = useState("");
    const [myToken, setMyToken] = useState(null);
    const newGame = { //7 collumns by 6 rows
        board: Array(7).fill(null).map(() => Array(6).fill(null)),
        currentToken: "X",

        //Allows for less computation in checkWinner
        row:-1,
        col:-1
    };
    //Handle: if id =  null, you're doing singleplayer
    const [game, setGame] = useState({
        board:newGame.board,
        currentToken:newGame.currentToken,

        row:newGame.row,
        col:newGame.col
    });
    
    //Format the recieved-from-subscription payload to client-readable state 
    function formatPayload(newBoard,nextToken, lastRow, lastCol){
        const data = {
            board: newBoard,
            currentToken: nextToken,

            row:lastRow,
            col:lastCol
        };
        return data;
    };

    //Game channel subscription
    useEffect(() => {
    //Induce singleplayer
        if(gameId!=null){
            //Boot the client-side-render of the game, fetched from database
            async function initGameState() {
                const payload = await callSupabase("GET", tableName, gameId, null, null);
                if(payload==undefined){
                setErrorMessage("Lobby not found")
                return;
                }
                console.log(payload.data.board);
                setGame(formatPayload(payload.data.board,payload.data.nextToken, payload.data.lastRow, payload.data.lastCol));
                setMyToken(null);
                calculateWinner(payload.data.board, payload.data.lastRow, payload.data.lastCol);
            };
            initGameState();
            setInLobby(true);

            //Subscribe the game's channel, inform client of table updates (and joins/leaves)
            const channel = createClient()
                .channel(`${gameId}`)
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName, filter:`id=eq.${gameId}`}, 
                (payload) => {
                        const formatedPayload = formatPayload(payload.new.board, payload.new.nextToken, payload.row, payload.col)
                        setGame(formatedPayload)
                        //console.log(payload.new.col+" "+payload.new.row);
                        calculateWinner(payload.new.board, payload.new.col, payload.new.row);
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

    const resetGame = async () => {
        setErrorMessage("");
        setWinnerArray([]);
        if(inLobby===true){
        //await api response & set login warning based on result
            try{
                callSupabase("PATCH", tableName, gameId, "RESET", gameKey);
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
    }


    //winning array contains ALL positions with connections of 4 or greater, positions may be unordered or repeated.

    const calculateWinner = (board, col, row) => {
        const flood = (col, row, incCol, incRow) =>{
            //Skip the starting token
            col+=incCol;
            row+=incRow;

            let connectedPositions = [];
            while(board[col] && board[col][row]==game.currentToken){
                connectedPositions.push([col,row]);
                col+=incCol;
                row+=incRow;
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
        //Setting a constant isn't guaranteed to sync, so editing it could fail to be reflected in the function.
        let funcToken = myToken;
        if(funcToken==null){
            setMyToken(game.currentToken);
            funcToken = game.currentToken;
            //console.log(funcToken);
        }
        else if(funcToken!=game.currentToken){
            setErrorMessage("It's not your turn! (Your Token = "+funcToken+")");
            return;
        }

        let rowResult = -1;
        const newBoard = game.board.map(innerArray => [...innerArray]);

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
            currentToken: game.currentToken === "X" ? "O" : "X",
        };

        if (!isOngoing || rowResult == -1) {
            setErrorMessage("Invalid move. Please try again.");
            return;
        }
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
            calculateWinner(newBoard,index,rowResult);
            setMyToken(updatedGame.currentToken);
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


            <div className={styles.appContainer}>
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
                        {game.board.map((col, colIndex) => (
                            <div
                                key={colIndex}
                                className = {styles.column}
                            >
                            {col.map((cell, cellIndex) => (
                                <div
                                    key={cellIndex}
                                    //className = {styles.cell}
                                    className = {
                                        [game.board[colIndex][cellIndex] == null ? styles.cell
                                        : (game.board[colIndex][cellIndex] == 'X') ? [styles.cell, styles.tokenA].join(" ")
                                        : [styles.cell, styles.tokenB].join(" "),
                                    
                                        winnerArray.some((arr) => JSON.stringify(arr) == JSON.stringify([colIndex,cellIndex])) ? styles.cellHighlight
                                        : (!isOngoing && winnerArray.length == 0) ? styles.cellFailure
                                        : ""
                                        ].join(" ")
                                    }
                                    onClick={() => makeMove(colIndex)}
                                >
                                {cell}
                                </div>
                            ))}
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









}
export default ConnectFour