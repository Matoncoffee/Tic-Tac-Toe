import React, { useState, useEffect } from 'react';
import './App.css'; // Optional: For styling

type SquareValue = 'X' | 'O' | null;

interface BoardProps {
  squares: SquareValue[];
  onClick: (i: number) => void;
}

const Board: React.FC<BoardProps> = ({ squares, onClick }) => {
  const renderSquare = (i: number) => (
    <button className="square" onClick={() => onClick(i)}>
      {squares[i]}
    </button>
  );

  return (
    <div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
};

const calculateWinner = (squares: SquareValue[]): SquareValue => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const isBoardFull = (squares: SquareValue[]): boolean => {
  return squares.every(square => square !== null);
};

const getBestMove = (squares: SquareValue[], player: SquareValue): number => {
  // Minimax algorithm implementation
  const opponent = player === 'X' ? 'O' : 'X';

  const minimax = (squares: SquareValue[], isMaximizing: boolean): number => {
    const winner = calculateWinner(squares);
    if (winner === player) return 10;
    if (winner === opponent) return -10;
    if (isBoardFull(squares)) return 0;

    const scores: number[] = [];
    const emptySquares = squares
      .map((value, index) => (value === null ? index : null))
      .filter(value => value !== null) as number[];

    for (const move of emptySquares) {
      const newSquares = squares.slice();
      newSquares[move] = isMaximizing ? player : opponent;
      scores.push(minimax(newSquares, !isMaximizing));
    }

    return isMaximizing
      ? Math.max(...scores)
      : Math.min(...scores);
  };

  const emptySquares = squares
    .map((value, index) => (value === null ? index : null))
    .filter(value => value !== null) as number[];

  let bestMove = emptySquares[0];
  let bestValue = -Infinity;

  for (const move of emptySquares) {
    const newSquares = squares.slice();
    newSquares[move] = player;
    const moveValue = minimax(newSquares, false);
    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }

  return bestMove;
};

const getRandomMove = (squares: SquareValue[]): number => {
  const emptySquares = squares
    .map((value, index) => (value === null ? index : null))
    .filter(value => value !== null) as number[];
  const randomIndex = Math.floor(Math.random() * emptySquares.length);
  return emptySquares[randomIndex];
};

const getMediumMove = (squares: SquareValue[], player: SquareValue): number => {
  const opponent = player === 'X' ? 'O' : 'X';

  const findWinningMove = (player: SquareValue): number => {
    const emptySquares = squares
      .map((value, index) => (value === null ? index : null))
      .filter(value => value !== null) as number[];
    for (const move of emptySquares) {
      const newSquares = squares.slice();
      newSquares[move] = player;
      if (calculateWinner(newSquares) === player) {
        return move;
      }
    }
    return -1;
  };

  const winningMove = findWinningMove(player);
  if (winningMove !== -1) return winningMove;

  const blockingMove = findWinningMove(opponent);
  if (blockingMove !== -1) return blockingMove;

  return getRandomMove(squares);
};

const Game: React.FC = () => {
  const [history, setHistory] = useState<SquareValue[][]>([Array(9).fill(null)]);
  const [stepNumber, setStepNumber] = useState<number>(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy'); // Difficulty level

  const xIsNext = stepNumber % 2 === 0;
  const currentSquares = history[stepNumber];
  const winner = calculateWinner(currentSquares);
  const isDraw = !winner && isBoardFull(currentSquares);

  const status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? 'Draw!'
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  const handleClick = (i: number) => {
    if (winner || currentSquares[i] || !isPlayerTurn) return;

    const squares = currentSquares.slice();
    squares[i] = 'X'; // Player's move
    setHistory(history.concat([squares]));
    setStepNumber(history.length);

    if (!calculateWinner(squares) && !isBoardFull(squares)) {
      setIsPlayerTurn(false);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner && !isDraw) {
      let move: number;

      switch (difficulty) {
        case 'easy':
          move = getRandomMove(currentSquares);
          break;
        case 'medium':
          move = getMediumMove(currentSquares, 'O');
          break;
        case 'hard':
          move = getBestMove(currentSquares, 'O');
          break;
      }

      const timeout = setTimeout(() => {
        handleComputerMove(move);
      }, 500); // Simulate a delay for the computer's move

      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn, currentSquares, winner, isDraw, difficulty]);

  const handleComputerMove = (i: number) => {
    const squares = currentSquares.slice();
    squares[i] = 'O'; // Computer's move
    setHistory(history.concat([squares]));
    setStepNumber(history.length);
    setIsPlayerTurn(true);
  };

  const jumpTo = (step: number) => {
    setStepNumber(step);
    setIsPlayerTurn(step % 2 === 0);
  };

  const moves = history.map((squares, move) => {
    const description = move ? `Go to move #${move}` : 'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={currentSquares} onClick={handleClick} />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <div>
          Difficulty: 
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <ol>{moves}</ol>
      </div>
    </div>
  );
};

export default Game;
