"use server"
//The following modules are, effectively, public-facing API endpoints.
import { supabase } from '../../../lib/supabase';

type request = {
    table: string,
    id: number,
    name?:string,
    body:{
        board: Array<string>
        currentToken: string
    },
}

type TicTacToe_Response = {
    id: number,
    boardState: Array<string>,
    nextToken: string,
}

export async function createGame(req:request){
    const user = supabase.auth.getUser();
    if(!user){
        console.log('failed to send');
        return;
    }
    const { data, error } = await supabase
    .from(req.table)
    .insert({'boardState': req.body.board, 'nextToken': req.body.currentToken, 'name':req.name, 'user_id':user})
    if(data == null){
        //change @ later date for actual handling
        return error;
    }
    return data;
}

export async function sendEvent(req:request, res:string) {
    if(!supabase){
        console.log('failed to send');
        return;
    }
    
    const { data, error } = await supabase
    .from(req.table)
    .select("*")
    .eq('id', req.id)
    .limit(1)

    if(data == null){
        //change @ later date for actual handling
        return error;
    }
    //For cheating-checks, we can redo game validation here.
    if(req.table === "TicTacToe"){
        const singleData:TicTacToe_Response = data[0]
        if(req.body.board.length !== 9){
            res = "Client did not provide a complete gameState";
            return res;
        }

        let commitingReset:boolean = true;
        let overwriting:boolean = false;
        let differences:number = 0;
        for(let i = 0; i < req.body.board.length; ++i){
            if(singleData.boardState[i] != req.body.board[i]){
                if(req.body.board[i]!=null){
                    commitingReset = false;
                }
                if(singleData.boardState[i]!=null)
                    overwriting = true;
                differences++;
            }
            if (!commitingReset){
                if(differences > 1){
                    res = "Differences in database vs client = "+differences;
                    return res;
                }
                if(overwriting){
                    res = "Attempted to overwrite existing piece";
                    return res;
                }
            }
        }
    }
    //End TicTacToe Validation


    //console.log(req);
    await supabase
    .from(req.table)
    .update({'boardState': req.body.board, 'nextToken': req.body.currentToken})
    .eq('id', req.id)
};

//include >> In supabase <<  restrictions on who can access which tables.
export async function fetchData(table:string, id:number){
    if(!supabase){
        console.log('failed to retrieve data');
        return;
    }
    const res = await supabase.from(table).select("*").eq('id', id).limit(1);
    if(res.data==null)
        return;
    return res.data[0];
};
