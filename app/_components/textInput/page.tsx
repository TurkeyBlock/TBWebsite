"use client"

const TextInput = ({inputText="", setInputText, buttonLabel = "Submit", handleSubmit}) => {
  const handleChange = (event) => {
    setInputText(event.target.value);
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
