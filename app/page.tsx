"use client"
import TextInput from "./_components/textInput/page"
import { useState} from "react";

export default function Page() {
  const [inputText, setInputText] = useState("");
  return (
    <div>
      <TextInput inputText={inputText} setInputText={setInputText} buttonLabel="Submit" handleSubmit={ console.log({inputText})}/>
      <h1>Hello D&D Nerds</h1>
      <h2>@Turkeyblock.org</h2>
      <a>aa</a>
      
      And this is text 1
      And this is text 2
      Etc Etc
    </div>
  )
}