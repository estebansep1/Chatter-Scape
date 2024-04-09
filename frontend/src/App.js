import React, { useEffect } from 'react';

function App() {
  useEffect (() => {
    fetch('http://localhost:5001').then(response => response.text()).then(message => {
      alert(message)
    })
  }, [])

  return (
    <div className="App">
    </div>
  );
}

export default App;
