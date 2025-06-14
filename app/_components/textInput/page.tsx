"use client"

import { ChangeEventHandler, FormEventHandler } from "react";


interface Props {
  boxLabel?:string;
  inputText?: string;
  buttonLabel?: string;
  setInputText:ChangeEventHandler;
  handleSubmit: FormEventHandler;
  hide?:boolean;
}
const TextInput = ({boxLabel = "Input Text:", inputText="", buttonLabel = "Submit", setInputText, handleSubmit, hide=false}: Props) => {
  const handleChange = (event:any) => {
    setInputText(event.target.value);
    console.log(event.target.value);
  };
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', display:hide === true ? 'none': ''}}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="textInput" style={{ marginRight: '10px' }}>
          {boxLabel}
        </label>
        <input
          type="text"
          id="textInput"
          value={inputText}
          onChange={handleChange}
          style={{
            padding: '5px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}

export default TextInput;
