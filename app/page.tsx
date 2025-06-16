"use client"
import TextInput from "./_components/textInput/page"
import { useState} from "react";
import { supabase } from '@/lib/supabase'

async function getTable(){
  const { data, error } = await supabase.functions.invoke('postgres-edge', {
    body: { name: 'Functions' },
  })
  console.log(data);
}
export default function Page() {
  async function anonyLogin(){
    const { data, error } = await supabase.auth.signInAnonymously()
    if(error){
      console.log(error);
    }
    console.log(data);
  }
  return (
    <div>
      <button style={{backgroundColor:"red" }}onClick={anonyLogin}>Temporary Log-in Button</button>
      <h1>Hello D&D Nerds</h1>
      <h2>@Turkeyblock.org</h2>
      <a>aa</a>
      <button style={{padding:"3px"}} onClick={getTable}>"Click for Table"</button>
      And this is text 1
      And this is text 2
      Etc Etc
    </div>
  )
}