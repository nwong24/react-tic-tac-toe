import { useState } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, currentPlayer }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = currentPlayer;
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


function findBestMove(squares, player) {
  const opponent = player === 'O' ? 'X' : 'O';
  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];

  /* written with help from sonnet */
  function minimax(board, depth, isMaximizing) {
    /* base cases */
    const winner = calculateWinner(board);
    if (winner === player)
      return 10 - depth;
    if (winner === opponent)
      return depth - 10;
    if (!board.some(s => s === null))
      return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = isMaximizing ? player : opponent;
        const score = minimax(board, depth + 1, !isMaximizing);
        board[i] = null;
        bestScore = isMaximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
      }
    }
    return bestScore;
  }

  let bestScore = -Infinity;
  let bestMove;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      squares[i] = player;
      const score = minimax(squares, 0, false);
      squares[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

export default function Game() {
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];
  const [currentPlayer, setCurrentPlayer] = useState('X');

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setXIsNext(true);
    setCurrentMove(0);
    setCurrentPlayer('X');
  }

  function handleSwitch() {
    const nextCurrent = currentPlayer === 'X' ? 'O' : 'X';
    const computerPlayer = currentPlayer;
    const nextSquares = currentSquares.slice();
    const move = findBestMove(currentSquares, computerPlayer);
    /* while legal moves still exist */
    if (move !== undefined && calculateWinner(nextSquares) === null) {
      nextSquares[move] = computerPlayer;
      handlePlay(nextSquares, nextCurrent);
      setCurrentPlayer(nextCurrent);
    }
  }

  function handlePlay(nextSquares, currentCurrent = currentPlayer) {
    let nextHistory = [...history.slice(0, currentMove + 1), nextSquares];

    const nextXIsNext = nextHistory.length % 2 === 1;
    const nextPlayer = nextXIsNext ? 'X' : 'O';

    if (nextSquares.some(s => s === null) && !calculateWinner(nextSquares) && nextPlayer !== currentCurrent) {
      const autoSquares = nextSquares.slice();
      autoSquares[findBestMove(nextSquares, nextPlayer)] = nextPlayer;
      nextHistory = [...nextHistory, autoSquares];
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
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} currentPlayer={currentPlayer} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
      <div className="reset-button" style={{ marginLeft: '20px', marginTop: '16px' }}>
        <button onClick={() => resetGame()}>Reset Game</button>
        <button onClick={() => handleSwitch()} style={{ marginLeft: '10px' }}>
          Switch to Player {currentPlayer === 'X' ? 'O' : 'X'}
        </button>
      </div>
    </div>
  );
}
