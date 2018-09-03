import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Papel from './Papel';
import { PaperScope,Path,Point,Project,Tool } from 'paper'
import typeof {  ToolEvent, Tool as ToolType } from 'paper'


class App extends Component {


  onMouseDown = (toolEvent: ToolEvent) => {
        console.log("toolEvent.point");
      }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Papel onClick={this.onMouseDown} />

      </div>
    );
  }
}

export default App;
