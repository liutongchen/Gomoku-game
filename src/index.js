import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  static blackPieceName = "black";
  static whitePieceName = "white";

  render() {
    const blackSquare = <img className="black" src="black.png" alt="black" />;
    const whiteSquare = <img className="white" src="white.png" alt="white" />;

    let currentSquare = null;
    if (this.props.value) {
      currentSquare = blackSquare;
    } else if (this.props.value === false) {
      currentSquare = whiteSquare;
    }

    return <button className="square" onClick={this.props.onClick}>{currentSquare}</button>;
  }
}

class Board extends React.Component {
  static boardWidth = 15;
  static boardHeight = 15;


  renderSquare(x, y) {
    return <Square key={[x, y]} onClick={() => { this.props.onClick(x, y) }} value={this.props.squares[y][x]} />;
  }


  render() {
    let boardArray = [];

    for (let col = 0; col < Board.boardHeight; col++) {
      let rowArray = [];
      for (let row = 0; row < Board.boardWidth; row++) {
        rowArray.push(this.renderSquare(row, col));
      };

      boardArray.push(rowArray);
    }

    return (
      <div>
        {
          // TODO: use the coordinator as key later.
          boardArray.map((eachRow) => <div className="boardRow" key={Math.random()}>{eachRow}</div>)
        }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      isBlackNext: true,
      winner: null,
      currentSquares: Array(Board.boardHeight).fill(null).map(row => Array(Board.boardWidth).fill(null)),
      history: { back: [], forward: [] }
    }
  }

  //event handlers
  squareClickHandler(x, y) {
    const backHistory = this.state.history.back.slice();
    const squares = this.state.currentSquares.slice();

    if (squares[y][x] || this.state.winner) {
      return;
    }

    squares[y][x] = this.state.isBlackNext;
    backHistory.push([x, y]);

    this.setState({
      currentSquares: squares,
      isBlackNext: !(this.state.isBlackNext),
      winner: Game.checkWinner(x, y, squares) ? Game.getPieceName(squares[y][x]) : null,
      history: { back: backHistory, forward: [] },
    });
  }

  startOverBtnHandler() {
    this.setState({
      isBlackNext: true,
      winner: null,
      currentSquares: Array(Board.boardHeight).fill(null).map(row => Array(Board.boardWidth).fill(null)),
      history: { back: [], forward: [] }
    });
  }

  backBtnHandler() {
    const backHistory = this.state.history.back.slice();
    const forwardHistory = this.state.history.forward.slice();
    const squares = this.state.currentSquares.slice();
    if (backHistory.length <= 0) {
      return
    }

    const lastX = backHistory[backHistory.length - 1][0];
    const lastY = backHistory[backHistory.length - 1][1];

    forwardHistory.push([lastX, lastY]);
    squares[lastY][lastX] = null;
    backHistory.pop();

    this.setState({
      currentSquare: squares,
      history: { back: backHistory, forward: forwardHistory },
      isBlackNext: !(this.state.isBlackNext)
    })
  }

  nextBtnHandler() {
    const forwardHistory = this.state.history.forward.slice();
    const backHistory = this.state.history.back.slice();
    const squares = this.state.currentSquares.slice();
    if (forwardHistory.length <= 0) {
      return
    }
    const lastX = forwardHistory[forwardHistory.length - 1][0];
    const lastY = forwardHistory[forwardHistory.length - 1][1];

    squares[lastY][lastX] = this.state.isBlackNext;
    backHistory.push([lastX, lastY]);
    forwardHistory.pop();

    this.setState({
      history: { back: backHistory, forward: forwardHistory },
      isBlackNext: !(this.state.isBlackNext),
      currentSquares: squares
    })
  }

  //helper functions
  static getPieceName(isBlackNext) {
    if (isBlackNext === null) {
      return null;
    }
    return isBlackNext ? Square.blackPieceName : Square.whitePieceName;
  }

  //game flow functions
  static checkWinner(x, y, squares) {
    const direction = [
      [1, 0], //right
      [0, 1], //down
      [1, 1], //rightdown
      [-1, 1] //leftdown
    ];
    for (let i = 0; i < direction.length; i++) {
      const lengthPos = Game.getMaxLength(x, y, direction[i][0], direction[i][1], squares);
      const lengthNeg = Game.getMaxLength(x, y, -direction[i][0], direction[i][1], squares);
      if ((lengthNeg + lengthPos + 1) >= 5) {
        return true;
      }
    }
    return false;
  }

  static getMaxLength(x, y, xd, yd, squares) {
    let result = 0;
    let xp = x;
    let yp = y;
    while (true) {
      xp += xd;
      yp += yd;
      const isWithinBoard = xp >= 0 && xp < Board.boardWidth && yp >= 0 && yp < Board.boardHeight;
      const isConnected = isWithinBoard && Game.getPieceName(squares[yp][xp]) === Game.getPieceName(squares[y][x]);
      if (!isConnected || result >= 4) {
        return result;
      } else {
        result++;
      }
    }
  }


  render() {
    let status;
    const winner = this.state.winner;
    if (winner) {
      status = "Winner: " + winner;
    } else {
        status = "Next player: " + (this.state.isBlackNext ? Square.blackPieceName : Square.whitePieceName);
    }

    return (
      <div className="game">
        <div className="gameBoard">
          {/* check isFirstStart and hasWinner to determine whether to cover the board with a start/startover button */}
          <Board onClick={(x, y) => this.squareClickHandler(x, y)} squares={this.state.currentSquares} />
        </div>

        <div className="gameStatus">
          <div id="status">{status}
            <span className="tooltip"><a href="https://en.wikipedia.org/wiki/Gomoku">
            <img alt="Game Info" id="gameInfo" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfwtlIgAmeYLjFN06LBZzLtgp5KYg6jeksqeldE_kuwUvCNj1Z" />
            </a>
            <span className="tooltiptext">Game Info</span>
            </span>
          </div>
        </div>

        <div className="gameController">
          <button id="backBtn" onClick={() => this.backBtnHandler()}>Back</button>
          <button id="nextBtn" onClick={() => this.nextBtnHandler()}>Next</button>
          <button id="startOverBtn" onClick={() => this.startOverBtnHandler()}>Start Over</button>
        </div>
        
      </div>
    );
  }
}

ReactDOM.render(
  <Game />, document.getElementById('root')
);
