"use server"
import { supabase } from '../../../lib/supabase';
/*
req = {
    table:String,
    id:Number,
    body:{},
}
*/
export default async function sendEvent(req, res) {
    if(!supabase){
        console.log('failed to send');
        return;
    }
    //console.log(req);
    const { data, error } = await supabase
    .from(req.table)
    .update({'boardState': req.body.board, 'nextToken': req.body.currentToken})
    .eq('id', req.id)
}
