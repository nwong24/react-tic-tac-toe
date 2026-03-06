import { useState } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ squares, rows, cols, onPlay, currentPlayer }) {
  function handleClick(i) {
    if (calculateWinner(squares, cols) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = currentPlayer;
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares, cols);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + currentPlayer;
  }

  return (
    <>
      <div className="status">{status}</div>
      {Array.from({ length: rows }, (_, r) => (
        <div className="board-row" key={r}>
          {Array.from({ length: cols }, (_, c) => {
            const i = r * cols + c;
            return <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} />;
          })}
        </div>
      ))}
    </>
  );
}

function calculateWinner(squares, cols) {
  /* written with help from sonnet */
  const rows = squares.length / cols;
  const winLen = Math.min(rows, cols);
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const player = squares[r * cols + c];
      if (!player) continue;
      for (const [dr, dc] of directions) {
        let count = 1;
        while (
          count < winLen &&
          r + dr*count >= 0 && r + dr*count < rows &&
          c + dc*count >= 0 && c + dc*count < cols &&
          squares[(r + dr*count) * cols + (c + dc*count)] === player
        ) count++;
        if (count === winLen) return player;
      }
    }
  }
  return null;
}

function findBestMove(squares, player, cols) {
  const opponent = player === 'O' ? 'X' : 'O';

  /* written with help from sonnet */
  /* had to replace minimax because it was too slow */
  function minimax(board, depth, isMaximizing, alpha, beta) {
    const winner = calculateWinner(board, cols);
    if (winner === player) return 10 - depth;
    if (winner === opponent) return depth - 10;
    if (!board.some(s => s === null)) return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = isMaximizing ? player : opponent;
        const score = minimax(board, depth + 1, !isMaximizing, alpha, beta);
        board[i] = null;
        if (isMaximizing) {
          bestScore = Math.max(bestScore, score);
          alpha = Math.max(alpha, bestScore);
        } else {
          bestScore = Math.min(bestScore, score);
          beta = Math.min(beta, bestScore);
        }
        if (beta <= alpha) break;
      }
    }
    return bestScore;
  }

  let bestScore = -Infinity;
  let bestMove;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      squares[i] = player;
      const score = minimax(squares, 0, false, -Infinity, Infinity);
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
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [pendingRows, setPendingRows] = useState(3);
  const [pendingCols, setPendingCols] = useState(3);

  const xIsNext = currentMove % 2 === 0;

  function resetGame(r, c) {
    setHistory([Array(r * c).fill(null)]);
    setCurrentMove(0);
    setCurrentPlayer('X');
  }

  function handleSwitch() {
    const nextCurrent = currentPlayer === 'X' ? 'O' : 'X';
    const computerPlayer = currentPlayer;
    const nextSquares = currentSquares.slice();
    const move = findBestMove(currentSquares, computerPlayer, cols);
    /* while legal moves still exist */
    if (move !== undefined && calculateWinner(nextSquares, cols) === null) {
      nextSquares[move] = computerPlayer;
      handlePlay(nextSquares, nextCurrent);
      setCurrentPlayer(nextCurrent);
    }
  }

  function handlePlay(nextSquares, currentCurrent) {
    let nextHistory = [...history.slice(0, currentMove + 1), nextSquares];

    const nextXIsNext = nextHistory.length % 2 === 1;
    const nextPlayer = nextXIsNext ? 'X' : 'O';

    if (nextSquares.some(s => s === null) && !calculateWinner(nextSquares, cols) && nextPlayer !== currentCurrent) {
      const autoSquares = nextSquares.slice();
      autoSquares[findBestMove(nextSquares, nextPlayer, cols)] = nextPlayer;
      nextHistory = [...nextHistory, autoSquares];
    }

    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
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
        <Board squares={currentSquares} rows={rows} cols={cols} onPlay={(sq) => handlePlay(sq, currentPlayer)} currentPlayer={currentPlayer} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
      <div className="reset-button" style={{ marginLeft: '20px', marginTop: '16px' }}>
        <button onClick={() => resetGame(rows, cols)}>Reset Game</button>
        <button onClick={() => handleSwitch()} style={{ marginLeft: '10px' }}>
          Switch to Player {currentPlayer === 'X' ? 'O' : 'X'}
        </button>
        <input type="text" value={pendingRows} onChange={e => setPendingRows(+e.target.value)} style={{ width: '30px' }} />
        x
        <input type="text" value={pendingCols} onChange={e => setPendingCols(+e.target.value)} style={{ width: '30px' }} />
        <button onClick={() => {
          // with help from sonnet
          if (currentSquares.some(s => s !== null)) return;
          setRows(pendingRows);
          setCols(pendingCols);
          if (pendingRows === rows && pendingCols === cols) return;
          const newSquares = Array(pendingRows * pendingCols).fill(null);
          const newHistory = [...history.slice(0, currentMove), newSquares];
          setHistory(newHistory);
          setCurrentMove(newHistory.length - 1);
        }}>
          Set Size
        </button>
      </div>
    </div>
  );
}
