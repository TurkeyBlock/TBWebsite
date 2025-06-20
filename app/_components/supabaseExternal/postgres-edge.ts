

import { createClient } from 'npm:@supabase/supabase-js@2';

interface RequestBody {
  table: string,
  id?: number,
  action?: "RESET" | string,
  key?: string
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
    console.log("Is Authenticated Anonymous = "+user.is_anonymous);
    //-----------------------------------------------------------------------------------------------------------------
    //Begin undertaking requests
    let returnBody:unknown = null;
    const supabaseServicer = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    //There is no GET method atm. All GETs are processed as an actionless PATCH
    const reqBody:RequestBody = await req.json();
    if(req.method == 'GET' || req.method == 'PATCH'){
      const { data, error} = await supabaseServicer.from(reqBody.table).select('*').eq('id', reqBody.id).limit(1);
      if(error){
        throw new Error("Issue retrieving row using GET/PATCH");
      }
      const game = data[0];
      if(req.method == 'GET' || reqBody.action == null){
        returnBody = game;
      }
      else{
        //use the servicer to get the table's editKey
        //check if this user has the editing key (table = TABLE_keys), or if none was necessary
        const {data, error} = await supabaseServicer.from((reqBody.table).concat('_Keys')).select('editKey').eq('id', reqBody.id).limit(1);
        if (error) {
          throw new Error("Issue confirming edit key");
        }
        const editKey = data[0].editKey;
        if(editKey==null || editKey == "" || editKey==reqBody.key){
          //Commit game-specific actions <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          if(reqBody.table == "TicTacToe"){
            let newBoard:Array<string>;
            let newToken:string;

            //confirm that some action was actually requested.
            if(reqBody.action!=null){
              const instructions = reqBody.action.split(" ");
              if(instructions[0] == "RESET"){              
                newBoard = Array(9).fill(null);
                newToken = 'X';
              }
              else if(instructions[0] == "MOVE"){
                let token = instructions[1];
                let position = instructions[2];
                if(game.nextToken==token && game.board[position]==null){
                  newBoard = game.board;
                  newBoard[position] = token;
                  newToken = (token == "X" ? "O" : "X");
                }
                else{
                  throw new Error("Invalid move requested");
                }
              }
            }
            else{
              throw new Error("No action provided");
            }
            //client provided the table updating key, so the services makes their move. !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const { data, error } = await supabaseServicer.from(reqBody.table).update({'board': newBoard!, 'nextToken': newToken!}).eq('id', reqBody.id);
            if (error) {
              throw new Error("Move validated, Update failed.");
            }
          }
          else if(reqBody.table == "ConnectFour"){
            //Non TicTacToe handling
          }
          else{
            throw new Error("Invalid table requested");
          }
          returnBody = "OK";
        }
        else{
          throw new Error("Invalid edit key provided");
        }
      }
    }
    else{
      //POST Method -----------------------------------------------------------------------------------
      if(user.is_anonymous){
        throw new Error("Invalid method; POST is not yet available");
      }
      else{
        const { data:gameIds, error:searchingError} = await supabaseServicer.from((reqBody.table).concat('_Keys')).select('id').eq('creatorId', user.id);
        if (searchingError) {
          throw new Error("Failed during search for pre-existing games");
        }
        console.log("Found games under user ID:")
        console.log(gameIds);
        if(gameIds.length>0){
          console.log('bap existing games!');
          const gameIdValues = gameIds.map(obj => obj.id);
          console.log(gameIdValues);
          console.log(await supabaseServicer.from(reqBody.table).delete().in('id',gameIdValues));
          console.log(await supabaseServicer.from((reqBody.table).concat('_Keys')).delete().in('id',gameIdValues));
        }
        //Create a new game table and grab its generated ID
        const { data:newId, error:creationError} = await supabaseServicer.from(reqBody.table).insert({'name':'userTable'}).select('id');
        if (creationError) {
          throw new Error("Failed to create Game");
        }
        let newIdVal = newId[0].id;
        //Use generated ID to create corresponding KEY table
        if(!reqBody.key){
          reqBody.key = "";
        }
        const { data, error } = await supabaseServicer.from((reqBody.table).concat('_Keys')).insert({'id':newIdVal,'editKey':reqBody.key,'creatorId':user.id});
        if (error) {
          throw new Error("Failed to create Game keys");
        }
        //Upon successful creation of the rows, send user their game ID.
        returnBody = newIdVal;
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


