"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Cpu, RotateCcw, Circle, X } from "lucide-react";

type Player = "X" | "O" | null;
type GameMode = "1P" | "2P";

export function TicTacToe({ themeColor }: { themeColor: string }) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState<GameMode>("2P");
  const [winner, setWinner] = useState<Player | "Draw">(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // Check for winner
  useEffect(() => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    let isDraw = true;
    let foundWinner: Player = null;
    let lineFound: number[] | null = null;

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        foundWinner = board[a];
        lineFound = [a, b, c];
        break;
      }
    }

    if (foundWinner) {
      setWinner(foundWinner);
      setWinningLine(lineFound);
    } else if (!board.includes(null)) {
      setWinner("Draw");
    }
  }, [board]);

  // AI Move (Simple Random/Blocker)
  useEffect(() => {
    if (mode === "1P" && !xIsNext && !winner) {
      const timer = setTimeout(() => {
        // Try to find a winning move or block, otherwise pick random
        const availableMoves = board.map((val, idx) => (val === null ? idx : null)).filter((v) => v !== null) as number[];
        
        if (availableMoves.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableMoves.length);
          const move = availableMoves[randomIndex];
          
          const newBoard = [...board];
          newBoard[move] = "O";
          setBoard(newBoard);
          setXIsNext(true);
        }
      }, 500); // Small delay for realism
      return () => clearTimeout(timer);
    }
  }, [xIsNext, mode, winner, board]);

  const handleClick = (index: number) => {
    if (board[index] || winner || (mode === "1P" && !xIsNext)) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <h3 className="font-black text-slate-800 text-lg">Zero Kaata</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Classic Tic-Tac-Toe</p>
        </div>
        
        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setMode("1P"); resetGame(); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${mode === "1P" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Cpu className="w-3.5 h-3.5" /> 1P
          </button>
          <button
            onClick={() => { setMode("2P"); resetGame(); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${mode === "2P" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
          >
            <User className="w-3.5 h-3.5" /> 2P
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 mb-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {winner ? (
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm font-black text-slate-800 flex items-center gap-2"
            >
              {winner === "Draw" ? "It's a Draw! 🤝" : (
                <>Winner: <span style={{ color: winner === "X" ? themeColor : "#f43f5e" }}>{winner}</span> 🎉</>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="turn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-bold text-slate-500 flex items-center gap-1.5"
            >
              Turn: <span style={{ color: xIsNext ? themeColor : "#f43f5e", fontSize: "14px" }}>{xIsNext ? "X" : "O"}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6 w-full max-w-[280px]">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              disabled={!!winner || !!cell || (mode === "1P" && !xIsNext)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all duration-300
                ${!cell && !winner ? "bg-slate-50 hover:bg-slate-100 cursor-pointer active:scale-95 border-2 border-transparent hover:border-slate-200" : ""}
                ${cell ? "bg-white border-2 shadow-sm cursor-default" : ""}
                ${isWinningCell ? "scale-105 shadow-md" : ""}
              `}
              style={{
                borderColor: cell === "X" ? `${themeColor}40` : cell === "O" ? "#f43f5e40" : "",
                backgroundColor: isWinningCell ? (cell === "X" ? `${themeColor}15` : "#f43f5e15") : undefined
              }}
            >
              <AnimatePresence>
                {cell === "X" && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <X className="w-10 h-10 stroke-[3]" style={{ color: themeColor }} />
                  </motion.div>
                )}
                {cell === "O" && (
                  <motion.div
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Circle className="w-9 h-9 stroke-[4]" style={{ color: "#f43f5e" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Reset */}
      <button
        onClick={resetGame}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 px-4 rounded-full bg-slate-50 hover:bg-slate-100"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Play Again
      </button>
    </div>
  );
}
