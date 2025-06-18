"use client"
/*
import { supabase } from '@/lib/supabase'

interface RequestBody {
  table: string,
  game?: {
    token: string,
    board:Array<string>
  }
}
async function getTable(){
  //Pull user's current JWT.
  const { data: { session } } = await supabase.auth.getSession();
  const jwt = session?.access_token;
  
  //Invoke edge function with user's JWT.
  const { data, error } = await supabase.functions.invoke('postgres-edge', {
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
    body: {
      table: 'TicTacToe',
      action: 'Move',
      game: {
        board: '',
        token: 'X'
      }
    
    },
  })
  console.log(data);
}

  async function anonyLogin(){
    const { data, error } = await supabase.auth.signInAnonymously()
    if(error){
      console.log(error);
    }
    console.log(data);
  }

<button style={{backgroundColor:"red" }}onClick={anonyLogin}>Temporary Log-in Button</button>


<button style={{padding:"3px"}} onClick={getTable}>"Click for Table"</button>
*/


export default function Page() {
  return (
    <div>
      <h1>Hello D&D Nerds</h1>
      <h2>@Turkeyblock.org</h2>
      <a>aa</a>
      And this is text 1
      And this is text 2
      Etc Etc
    </div>
  )
}