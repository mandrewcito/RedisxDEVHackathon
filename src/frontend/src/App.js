import React from 'react';
import './App.css';
import MyRouter from './router';
import {store} from './store'
import { Provider } from 'react-redux'
function App() {
  return (
    <Provider store={store}>
      <div className="App" style={{height: "100%"}}>
          <MyRouter>
          </MyRouter>
      </div>
    </Provider>
  );
}

export default App;
