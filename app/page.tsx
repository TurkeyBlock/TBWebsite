"use client"

import { createClient } from '@/lib/supabase/client'
  async function anonyLogin(){
    const { data, error } = await createClient().auth.signInAnonymously()
    if(error){
      console.log(error);
    }
    console.log(data);
  }


export default function Page() {
  return (
    <div>
      <button style={{backgroundColor:"red" }}onClick={anonyLogin}>Temporary Log-in Button</button>
      <h1>Hello D&D Nerds</h1>
      <h2>@Turkeyblock.org</h2>
      <a>aa</a>
      And this is text 1
      And this is text 2
      Etc Etc
    </div>
  )
}