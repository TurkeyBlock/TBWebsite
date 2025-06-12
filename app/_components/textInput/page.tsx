import { useState } from 'react';

export default function TextInput() {
  const [text, setText] = useState('');

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`You entered: ${text}`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="textInput" style={{ marginRight: '10px' }}>
          Enter text:
        </label>
        <input
          type="text"
          id="textInput"
          value={text}
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
          Submit
        </button>
      </form>
    </div>
  );
}