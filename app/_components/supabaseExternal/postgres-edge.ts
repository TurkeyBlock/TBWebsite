import { createClient } from 'npm:@supabase/supabase-js@2';

function getNewBoard(gameName:string){
  let newBoard;
  if(gameName == "ConnectFour"){
    newBoard = Array(7).fill().map(()=>Array(6).fill(null));
  }
  else if(gameName == "TicTacToe"){
    newBoard = Array(9).fill(null);
  }
  return newBoard;
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
    //-----------------------------------------------------------------------------------------------------------------
    //Begin undertaking requests
    let returnBody = null;
    const supabaseServicer = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    //There is no GET method atm. All GETs are processed as an actionless PATCH.
    //This is because the GET methods don't appear to allow the clients to pass data for their request.
    const reqBody = await req.json();
    if (req.method == 'GET' || req.method == 'PATCH') {
      const { data: gameArray, error:gameArrayError } = await supabaseServicer.from(reqBody.table).select('*').eq('id', reqBody.id).limit(1);
      //console.log(data.length);
      if (gameArrayError || gameArray.length == 0) { throw new Error("Issue retrieving row using GET/PATCH");}
      const game = gameArray[0];
      if (req.method == 'GET' || reqBody.action == null) {
        returnBody = game;
      } else {
        console.log("patch function called");
        //use the servicer to get the table's editKey
        //check if this user has the editing key (table = TABLE_keys), or if none was necessary
        const { data:editKeyArray, error:editKeyArrayError } = await supabaseServicer.from(keyTable).select('editKey').eq('id', reqBody.id).limit(1);
        if (editKeyArrayError) {throw new Error("Issue confirming edit key");}
        const editKey = editKeyArray[0].editKey;
        if (editKey != null && editKey != "" && editKey != reqBody.key) {throw new Error("Invalid edit key provided");}
        
        //confirm that some action was actually requested.
        if (reqBody.action == null) { throw new Error("No action provided");}
        const instructions = reqBody.action.split(" ");
        
        //grab relevant player turn/owner data
        const { data:playerValidatorsArray, error:playerValidatorsArrayError } = await supabaseServicer.from(keyTable).select('creatorId, playerIds, currentPlayerIndex').eq('id', reqBody.id).limit(1);
        if(playerValidatorsArrayError){
          throw new Error("Issue retrieving list of game's players; unable to validate action");
        }
        const creatorId = playerValidatorsArray[0].creatorId;
        const playerIds = playerValidatorsArray[0].playerIds;
        const currentPlayerIndex = playerValidatorsArray[0].currentPlayerIndex;

        //Validate that it's this Player's turn.
        if(!validatePlayerTurn(playerIds,currentPlayerIndex,user.id)){
          throw new Error("Issue validating requesting player's action in the turn order");
        }
        //Commit game-specific actions <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        if (reqBody.table == "TicTacToe") {
          let newBoard;
          let newToken;
          
          if (instructions[0] == "RESET") {
            newBoard = getNewBoard(reqBody.table);
            newToken = 'X';
          } else if (instructions[0] == "MOVE") {
            
            
            //Validate the move action
            let token = instructions[1];
            let position = instructions[2];
            if (game.nextToken == token && game.board[position] == null) {
              newBoard = game.board;
              newBoard[position] = token;
              newToken = token == "X" ? "O" : "X";
            } else {
              throw new Error("Invalid move requested");
            }
          }
          //client provided the table updating key, so the services makes their move. !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          const { error } = await supabaseServicer.from(reqBody.table).update({
            'board': newBoard,
            'nextToken': newToken
          }).eq('id', reqBody.id);

          if (error) {
            throw new Error("Move validated, Update failed.");
          }
        } else if (reqBody.table == "ConnectFour") {
          let newBoard;
          let newToken;
          let rowResult;
          let col;
          if (instructions[0] == "RESET") {
            newBoard = getNewBoard(reqBody.table);
            newToken = 'X';
          } else if (instructions[0] == "MOVE") {
            let token = instructions[1];
            if (token != game.nextToken) {
              throw new Error("It's not this user's turn");
            }
            newToken = token == "X" ? "O" : "X";
            col = instructions[2];
            rowResult = -1;
            newBoard = game.board.map((innerArray)=>[
                ...innerArray
              ]);
            for(let i = newBoard[col].length - 1; i >= 0; --i){
              if (newBoard[col][i] == null) {
                newBoard[col][i] = token;
                rowResult = i;
                break;
              }
            }
            if (rowResult == -1) {
              throw new Error("Invalid move requested");
            }
          }
          //client provided the table updating key, so the services makes their move. !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          const { error } = await supabaseServicer.from(reqBody.table).update({
            'board': newBoard,
            'nextToken': newToken,
            'col': col,
            'row': rowResult
          }).eq('id', reqBody.id);

          if (error) {
            throw new Error("Move validated, Update failed.");
          }
        } else {
          throw new Error("Invalid table requested");
        }
        
        //Everything was successful, update the player-turn indicator

        let nextPlayerIndex = currentPlayerIndex+1;
        if(nextPlayerIndex >= playerIds.length){
          nextPlayerIndex = 0;
        }
        const { error:currentPlayerUpdateError } = await supabaseServicer.from(keyTable).update({
          'currentPlayerIndex':nextPlayerIndex
        }).eq('id', reqBody.id);
        if(currentPlayerUpdateError){
          throw new Error("Move was processed without updating current player. Desync is non-recoverable.")
        }
        returnBody = "OK";
      }
    } else {
      ////
      ////
      //POST Method -----------------------------------------------------------------------------------
      if (user.is_anonymous) {
        throw new Error("Invalid method; game creation is unavailable to guest accounts");
      } else {

        const { data: gameIds, error: searchingError } = await supabaseServicer.from(keyTable).select('id').eq('creatorId', user.id);
        if (searchingError) {
          throw new Error("Failed during search for pre-existing games");
        }

        if (gameIds.length > 0) {
          const gameIdValues = gameIds.map((obj)=>obj.id);
          await supabaseServicer.from(keyTable).delete().in('id', gameIdValues);
        }

        //Create a new KEY row and grab its generated ID
        if (!reqBody.key) {
          reqBody.key = "";
        }

        const { data: newKey, error } = await supabaseServicer.from(keyTable).insert({
          'editKey': reqBody.key,
          'creatorId': user.id
        }).select('*');

        if (error) {
          console.error('Error inserting data:', error);
          throw new Error("Failed to create Game keys");
        }
        let newKeyVal = newKey[0].editKey;
        let newIdVal = newKey[0].id;

        //Use generated ID to create corresponding GAME row
        let newBoard = getNewBoard(reqBody.table);
        const {error: creationError } = await supabaseServicer.from(reqBody.table).insert({
          'id': newIdVal,
          'name': 'userTable',
          'board': newBoard
        });
        if (creationError) {
          throw new Error("Failed to create Game");
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
