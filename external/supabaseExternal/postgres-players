import { createClient } from 'npm:@supabase/supabase-js@2';

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
    const playerTable = 'GamePlayers';
    const keyTable = 'GameKeys';
    //-----------------------------------------------------------------------------------------------------------------
    
    //Process input, prep output var
    let returnBody = null;
    const reqBody = await req.json();

    //Before anything else, confirm that some action was requested. It take practically no effort.
    if (reqBody.action == null) { throw new Error("No action provided");}
    const instructions = reqBody.action.split(" ");

    //Begin undertaking requests
    const supabaseServicer = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

    const {data:gameIsPublicSingle, error:gameIsPublicError } = await supabaseServicer.from(reqBody.table).select('public').eq('id', reqBody.id).single();
    if (gameIsPublicError) {
      throw new Error("Issue confirming game's existance in table "+reqBody.table);
    } else if (gameIsPublicSingle == null) {
      throw new Error("Game id does not exist in requested table "+reqBody.table);
    }

    let creatorId = "";
    let editKey = "";
    //Don't make an unneccessary querry if we can avoid it. 
    // (Only kicks & keyed lobbies require the key table)
    if(gameIsPublicSingle.public == false || instructions[0]=="KICK"){
      const { data:editKeyRow, error:editKeyRowError } = await supabaseServicer.from(keyTable).select('editKey, creatorId').eq('id', reqBody.id).single();
      if (editKeyRowError) {throw new Error("Issue confirming edit key");}
      creatorId = editKeyRow.creatorId;
      editKey = editKeyRow.editKey;
      if (editKey != null && editKey != "" && editKey != reqBody.key) {throw new Error("Invalid edit key provided");}
    }
    
    //grab relevant player turn/owner data
    const { data:playerValidator, error:playerValidatorError } = await supabaseServicer.from(playerTable).select('playerIds, playerNames, currentPlayerIndex, maxPlayers').eq('id', reqBody.id).single();
    if(playerValidatorError){
      throw new Error("Issue retrieving list of game's players; unable to validate action");
    }
    const playerIds = playerValidator.playerIds;
    const playerNames = playerValidator.playerNames;
    const currentPlayerIndex = playerValidator.currentPlayerIndex;
    const maxPlayers = playerValidator.maxPlayers;

    //If the game-owner wants to kick a player...
    if(instructions[0]=="KICK" && (user.id == creatorId || user.id == Deno.env.get('ADMIN_UID')) && playerIds.length > instructions[1]){
      playerIds[instructions[1]] = null;
      playerNames[instructions[1]] = null;
      const { error:kickError } = await supabaseServicer.from(playerTable).update({
        'playerIds': playerIds,
        'playerNames': playerNames
      }).eq('id', reqBody.id);
      if(kickError){throw new Error("Error attempting to kick a player");}
    }

    //If a player wants to join the game...
    else if(instructions[0]=="JOIN"){
      if(playerIds.indexOf(user.id)!=-1){
        //The player disconnected inappropriately and is still registered in the Lobby
        returnBody = playerValidator;
      }
      else{
        let insertingPlayer = false;
        //Check for an open slot, or make a new slot if the current array isn't @ maxPlayers.
        var openSpace = playerIds.indexOf(null);
        if(openSpace == -1){ //No explicitly open spot
          if(playerIds.length < maxPlayers){ //The storage array isn't appropriately sized. (Increase it)
            playerIds.push(user.id);
            playerNames.push(user.user_metadata.displayName);
            insertingPlayer = true;
          }
          else{//Game is full
            returnBody = playerValidator;
          }
        }else{
          playerIds[openSpace] = user.id;
          playerNames[openSpace] = user.user_metadata.displayName;
          insertingPlayer = true;
        }
        if(insertingPlayer){
          const { data:updatedPlayerRow, error:joinError } = await supabaseServicer.from(playerTable).update({
            'playerIds': playerIds,
            'playerNames': playerNames
          }).eq('id', reqBody.id).select().single();
          if(joinError){throw new Error("Error attempting to join game", joinError );}
          returnBody = updatedPlayerRow;
        }
      }
    }
    else if(instructions[0]=="LEAVE"){
        const requestingPlayerIndex = playerIds.indexOf(user.id);
        if(requestingPlayerIndex!=-1){
            playerIds[requestingPlayerIndex] = null;
            playerNames[requestingPlayerIndex] = null;
            const { error:leaveError } = await supabaseServicer.from(playerTable).update({
                'playerIds': playerIds,
                'playerNames': playerNames
                //'currentPlayerIndex': nextPlayerIndex
            }).eq('id', reqBody.id);
            if(leaveError){throw new Error("Error attempting to leave the game:", leaveError );}
        }
    }
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