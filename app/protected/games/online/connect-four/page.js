
"use client"
import styles from "./page.module.css";

import {useState, forwardRef, useImperativeHandle} from "react";

const ConnectFour = forwardRef(({inLobby = false, gameId = null, onlineMakeMove, onlineResetGame, setErrorMessage}, ref) => {
    const newGame = { //7 collumns by 6 rows
        board: Array(7).fill(null).map(() => Array(6).fill(null)),
        nextToken: "X",

        //Allows for less computation in checkWinner
        row:-1,
        col:-1
    };
    const [game, setGame] = useState(newGame);
    const [winnerArray, setWinnerArray] = useState([]);
    
    //temp - doesn't account for filled boards.
    const isOngoing = winnerArray.length == 0;
    const winner = !isOngoing && game.board[winnerArray[0][0]][winnerArray[0][1]];


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
            let isNewGame = false;
            if(JSON.stringify(game.board)==JSON.stringify(newGame.board)){
                isNewGame = true;
            }
            onlineMakeMove(isNewGame, ("MOVE "+index))
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
    );









});

export default ConnectFour