import { createClient } from 'npm:@supabase/supabase-js@2';

function getNewBoard(gameName:string){
  let newBoard;
  if(gameName == "ConnectFour"){
    newBoard = Array(7).fill().map(()=>Array(6).fill(null));
  }
  else if(gameName == "TicTacToe"){
    newBoard = Array(9).fill(null);
  }
  else if(gameName == "Checkers"){
    newBoard = Array(8).fill().map(()=>Array(8).fill(null));
    newBoard[0] = ['o',null,'o',null,'o',null,'o',null]
    newBoard[1] = [null,'o',null,'o',null,'o',null,'o']
    newBoard[6] = ['x',null,'x',null,'x',null,'x',null]
    newBoard[7] = [null,'x',null,'x',null,'x',null,'x']
  }
  return newBoard;
}

function isInbounds(val:number, maxVal:number, minVal:number = 0){
  return val < maxVal && val >= minVal;
}

function getNewGame(gameName:string){
  let newGame = {};
  if(gameName == "ConnectFour"){
    newGame = {
      'board':getNewBoard(gameName),
      'nextToken':"X",
      'col':0,
      'row':0
    }
  }
  else if(gameName == "TicTacToe"){
    newGame = {
      'board':getNewBoard(gameName),
      'nextToken':"X"
    }
  }
  else if(gameName == "Checkers"){
    newGame = {
      'board':getNewBoard(gameName),
      'nextToken':"X",
      'moveStack':[]
    }
  }
  return newGame;
}

function validatePlayerTurn(playerIds:string[], currentPlayerIndex:number, requestingPlayerId:string){
  if(playerIds.length > currentPlayerIndex && playerIds[currentPlayerIndex] == requestingPlayerId){
    return true;
  }
  return false;
}

Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*'
      },
      status: 200
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    // Get the session or user object
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        status: 401
      });
    }
    //console.log("Is Authenticated Anonymous = " + user.is_anonymous);
    const keyTable = 'GameKeys';
    const playerTable = 'GamePlayers'
    //-----------------------------------------------------------------------------------------------------------------
    //Begin undertaking requests
    let returnBody = null;
    const supabaseServicer = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    //There is no GET method atm. All GETs are processed as an actionless PATCH.
    //This is because the GET methods don't appear to allow the clients to pass data for their request.
    const reqBody = await req.json();
    if(reqBody.table!=="TicTacToe" && reqBody.table!=="ConnectFour" && reqBody.table!=="Checkers"){
      throw new Error("Unavailable table requested");
    }

    //Used in both PATCH and POST
    let newGamestate;

    if (req.method == 'GET' || req.method == 'PATCH') {
      const { data: tableRow, error:tableError } = await supabaseServicer.from(reqBody.table).select('*').eq('id', reqBody.id).single();

      if (tableError || tableRow == null) { throw new Error("Issue retrieving row using GET/PATCH");}
      const gameName = tableRow.name;
      const game = tableRow.game; 


      if (req.method == 'GET' || reqBody.action == null) {
        returnBody = game;
      } else{
        //update game
        //confirm that some action was actually requested.
        if (reqBody.action == null) { throw new Error("No action provided");}
        const instructions = reqBody.action.split(" ");
        
        //grab relevant player turn/owner data
        const { data:playerValidator, error:playerValidatorError } = await supabaseServicer.from(playerTable).select('playerIds, currentPlayerIndex, maxPlayers').eq('id', reqBody.id).single();
        if(playerValidatorError){throw new Error("Issue retrieving list of game's players; unable to validate action");}

        const playerIds = playerValidator.playerIds;
        const currentPlayerIndex = playerValidator.currentPlayerIndex;
        const thisUserIndex = playerIds.indexOf(user.id);
        const maxPlayers = playerValidator.maxPlayers;

        if(thisUserIndex==-1){throw new Error("User is not in the game's player list");}

        //Reset action
        if (instructions[0] == "RESET"){
          newGamestate = getNewGame(reqBody.table);
          const { error:resetError } = await supabaseServicer.from(reqBody.table).update({
            game:newGamestate
          }).eq('id', reqBody.id);
          const { error:resetPlayerError } = await supabaseServicer.from(playerTable).update({
            currentPlayerIndex:-1
          }).eq('id', reqBody.id);
        }
        //Move actions
        else if (instructions[0] == "MOVE") {
          //First, validate the user's turn.
          if(!validatePlayerTurn(playerIds,currentPlayerIndex,user.id) && JSON.stringify(game.board)!=JSON.stringify(getNewBoard(reqBody.table))){
            throw new Error("Issue validating requesting player's action in the turn order");
          }

          //Second, validate the action at hand
          if(reqBody.table == "TicTacToe"){
            let position = instructions[1];
            if(!isInbounds(position,9)){
              throw new Error("Invalid Move; invalid index");
            }
            if (game.board[position] == null) {
              let newBoard = game.board;
              newBoard[position] = game.nextToken;
              let newToken = game.nextToken == "X" ? "O" : "X";

              newGamestate = {
                board:newBoard,
                nextToken:newToken
              }
            } else {
              throw new Error("Invalid move requested");
            }
          } 
          else if (reqBody.table == "ConnectFour") {
            let newToken = game.nextToken == "X" ? "O" : "X";
            let col = Number(instructions[1]);
            if(!isInbounds(col,7)){
              throw new Error("Invalid Move; invalid column");
            }
            let rowResult = -1;
            let newBoard = game.board.map((innerArray)=>[
              ...innerArray
            ]);
            for(let i = newBoard[col].length - 1; i >= 0; --i){
              if (newBoard[col][i] == null) {
                newBoard[col][i] = game.nextToken;
                rowResult = i;
                break;
              }
            }
            if (rowResult == -1) {
              throw new Error("Invalid move requested");
            }
            else{
              newGamestate = {
                board:newBoard,
                nextToken:newToken,
                col:col,
                row:rowResult
              }
            }
          }
          /*----*/
          else if(reqBody.table == "Checkers"){
            console.log('pip');
            
            //"MOVE" @ [0], select index @ [1], & etc. @ [2]+
            if(instructions.length < 3) {
              throw new Error("Invalid move requested");
            }

            let newBoard = game.board.map((innerArray)=>[
              ...innerArray
            ]);
            let newToken = game.nextToken == "X" ? "O" : "X";
            let newMoveStack = []
            for(let i = 1; i < instructions.length; i++){ //Skip "MOVE" action
              newMoveStack.push(parseInt(instructions[i]));
            }
            console.log(newMoveStack);
            newGamestate = {
              board:newBoard,
              nextToken:newToken,
              moveStack: newMoveStack
            }

            const initialIndex = newGamestate.moveStack[0];
            const prevRow = Math.floor(initialIndex/8);
            const prevCol = initialIndex%8;
            console.log(prevRow + " "+prevCol);
            if(newGamestate.board[prevRow][prevCol]?.toUpperCase()!=game.nextToken){
              throw new Error("Invalid move requested; Invalid initial Token");
            }
            if(!isInbounds(prevRow,8) || !isInbounds(prevCol,8)){
              throw new Error("Invalid move requested; Invalid initial row or column");
            }
            //X goes up, O goes down.
            const defaultDirection = game.nextToken == "X" ? 1:-1;

            let isKing = newGamestate.board[prevRow][prevCol] == game.nextToken;
            let canJump = true; //Moves can only occur once, immediately, so no need to track
            for(let i = 1; i < newGamestate.moveStack.length; i++){
              const curIndex = newGamestate.moveStack[i];
              const row = Math.floor(curIndex/8);
              const col = Math.floor(curIndex%8);
              if(!isInbounds(row,8) || !isInbounds(col,8)){
                throw new Error("Invalid move requested; Invalid row or column");
              }
              //First, check if we move or if we jump.
              const colDif = prevCol - col;
              const rowDif = prevRow - row;
              if(Math.abs(colDif) >=2){
                if(!canJump){
                  throw new Error("Invalid move requested; Attempted a jump after moving");
                }
                //Location must be 2 away, you must be king if going 'backwards', and you must jump an enemy piece
                if(!(rowDif==defaultDirection*2 || (isKing && rowDif==defaultDirection*-2)) || colDif!=2 || newGamestate.board[prevRow + rowDif/2][prevCol + colDif/2].toUpperCase() != newGamestate.nextToken){
                  throw new Error("Invalid move requested; Invalid Jump");
                }
                //Kinging occurs @ end
                newGamestate.board[row][col] = newGamestate.board[prevRow][prevCol];
                newGamestate.board[prevRow + rowDif/2][prevCol + colDif/2] = null;
                newGamestate.board[prevRow][prevCol] = null;
              }
              else{
                canJump = false;
                if(i != 1 ){
                  throw new Error("Invalid move requested; Attempted a second move");
                }
                if(rowDif!=defaultDirection || (isKing && rowDif!=defaultDirection*-1) && colDif!=1){
                  throw new Error("Invalid move requested; Invalid Movement");
                }
                newGamestate.board[row][col] = newGamestate.board[prevRow][prevCol];
                newGamestate.board[prevRow][prevCol] = null;
              }
              if((newGamestate.board[row][col] == 'x' && curIndex < newGamestate.board[0].length ) || (newGamestate.board[row][col] == 'o' && curIndex >= newGamestate.board[0].length*newGamestate.board.length - newGamestate.board[0].length)){
                newGamestate.board[row][col] = newGamestate.board[row][col].toUpperCase();
                isKing = true;
              }
            }
          }
          /*----*/
          const { error:updateError } = await supabaseServicer.from(reqBody.table).update({
            game:newGamestate
          }).eq('id', reqBody.id);

          let nextPlayerIndex = thisUserIndex+1;
          if(nextPlayerIndex >= maxPlayers){
            nextPlayerIndex = 0;
          }
          const { error:currentIndexUpdateError } = await supabaseServicer.from(playerTable).update({
            'currentPlayerIndex':nextPlayerIndex
          }).eq('id', reqBody.id);
        }
      }
    }
    //Creation of a game request
    else{
      if (false/*user.is_anonymous*/) {
        throw new Error("Invalid method; game creation is unavailable to guest accounts");
      }
      else {

        const { data: gameIds, error: searchingError } = await supabaseServicer.from(keyTable).select('id').eq('creatorId', user.id);
        if (searchingError) {
          throw new Error("Failed during search for pre-existing games");
        }

        if (gameIds.length > 0) {
          const gameIdValues = gameIds.map((obj)=>obj.id);
          await supabaseServicer.from(keyTable).delete().in('id', gameIdValues);
        }

        //Create a new KEY row and grab its generated ID
        let publicGame = false;
        if (!reqBody.key || reqBody.key == "") {
          reqBody.key = "";
          publicGame = true;
        }

        const { data: newKey, error:keyTableError } = await supabaseServicer.from(keyTable).insert({
          'editKey': reqBody.key,
          'creatorId': user.id
        }).select('*');

        if (keyTableError) {
          console.error('Error inserting data:', keyTableError);
          throw new Error("Failed to create Game keys");
        }
        let newKeyVal = newKey[0].editKey;
        let newIdVal = newKey[0].id;

        //Use generated ID to create corresponding PLAYERS row
        const {error: playerTableError} = await supabaseServicer.from(playerTable).insert({
          'id':newIdVal,
          'playerIds':[null, null]
        });
        if(playerTableError) {
          throw new Error("Failed to create Player Table");
        }

        //Use generated ID to create corresponding GAME row
        newGamestate = getNewGame(reqBody.table);
        const {error: gameTableError } = await supabaseServicer.from(reqBody.table).insert({
          'id': newIdVal,
          'name': 'userTable',
          'game': newGamestate,
          'public': publicGame
        });
        if (gameTableError) {
          throw new Error("Failed to create Game Table");
        }
        //Upon successful creation of the rows, send user their game ID.
        returnBody = {
          id: newIdVal,
          key: newKeyVal
        };
      }
    }
    //return the new/current gameState
    return new Response(JSON.stringify({
      returnBody
    }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
