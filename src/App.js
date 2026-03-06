import { useState } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

function calculateWinner(squares) {
  const re = /^(?:(?:...){0,2}([OX])\1\1|.{0,2}([OX])..\2..\2|([OX])...\3...\3|..([OX]).\4.\4)/g;
  const myString = squares.map(s => s === null ? '-' : s).join('');
  const match = re.exec(myString);

  if (match)
    return match[1] || match[2] || match[3] || match[4];
  
  return null;
}

function findBestMove(squares) {
  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  /* find winning move for O */
  let squaresCopy = squares.slice();
  for (let i = 0; i < squaresCopy.length; i++) {
    if (squaresCopy[i] === null) {
      squaresCopy[i] = 'O';
      if (calculateWinner(squaresCopy) === 'O')
        return i;
      squaresCopy[i] = null;
    }
  }
  /* if we're here there was no winning move */
  /* try to block X from winning */
  for (let i = 0; i < squaresCopy.length; i++) {
    if (squaresCopy[i] === null) {
      squaresCopy[i] = 'X';
      if (calculateWinner(squaresCopy) === 'X')
        return i;
      squaresCopy[i] = null;
    }
  }
  for (let i = 0; i < moveOrder.length; i++) {
    if (squares[moveOrder[i]] === null)
      return moveOrder[i];
  }
  /* we should not be here */
}

export default function Game() {
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setXIsNext(true);
    setCurrentMove(0);
  }

  function handlePlay(nextSquares) {
    let nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
  
    /* if there hasn't been a winner and there are still empty squares */
    /* let the automated moves happen */
    if (!calculateWinner(nextSquares) && nextSquares.some(s => s === null)) {
      const oSquares = nextSquares.slice();
      oSquares[findBestMove(nextSquares)] = 'O';
      nextHistory = [...nextHistory, oSquares];
    }
  
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setXIsNext(nextMove % 2 === 0);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
      <div className="reset-button" style={{ marginLeft: '20px', marginTop: '16px' }}>
        <button onClick={() => resetGame()}>Reset Game</button>
      </div>
    </div>
  );
}
