"use client"
import TextInput from "./_components/textInput/page"
import { useState} from "react";
import { supabase } from '../lib/supabase'

async function getTable(){
  const { data, error } = await supabase.functions.invoke('postgres-edge', {
    body: { name: 'Functions' },
  })
  console.log(data);
}
export default function Page() {
  const [inputText, setInputText] = useState("");
  return (
    <div>
      <TextInput inputText={inputText} setInputText={setInputText} buttonLabel="Submit" handleSubmit={ console.log({inputText})}/>
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