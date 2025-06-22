"use client"

import { useEffect, useState} from "react";
import styles from "./page.module.css";
import { createClient } from '@/lib/supabase/client'
import {callSupabase} from '../_supabaseEdgeCaller'

const TicTacToe = () => {
    const tableName = "TicTacToe";

    const [gameId, setGameId] = useState(null);
    const [gameKey, setGameKey] = useState(null);

    const [inLobby, setInLobby] = useState(false);  //Boolean to check for success in joining a lobby
    const [isLocked, setIsLocked] = useState(false); //Display boolean for if the lobby is locked

    const [inputGameId, setInputGameId] = useState("");  //Form input for lobby id.
    const [inputGameKey, setInputGameKey] = useState("");  //Form input for lobby key.

    const [chosenGameKey, setChosenGameKey] = useState(""); //Key creation for a new game

    const [errorMessage, setErrorMessage] = useState("");
    const [myToken, setMyToken] = useState(null);
    const [sidebar, setSidebar] = useState(true);

    function toggleSidebar(){
        setSidebar(sidebar?false:true);
    }
    
    //Handles submission to lobby-input form.
    function handleJoin(event){
        event.preventDefault(); //Do not refresh the page
        if(inLobby){
            setGameId(null);
            setInLobby(false);
            return;
        }
        setGameId(inputGameId);
        setGameKey(inputGameKey);
    }
    function handleCreate(event){
        event.preventDefault(); //Do not refresh the page
        submitGameCreate();
    }

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

    async function submitGameCreate(){
        if(!inLobby){
        //temp to get vercel off my back
        setIsLocked(false);

        const data = await callSupabase("POST", tableName, gameId, null, chosenGameKey);
        setGameId(data.id);
        setGameKey(data.key);

        //For visual sidebar purposes
        setInputGameId(data.id);
        setInputGameKey(data.key);
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
                if(payload==undefined){
                setErrorMessage("Lobby not found")
                return;
                }
                setGame(formatPayload(payload.board,payload.nextToken));
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











}