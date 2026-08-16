"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Cpu,
  RotateCcw,
  Circle,
  X,
  Trophy,
  Gamepad2,
  Brain,
  Zap,
  Sparkles,
  Award,
  Heart,
  Stethoscope,
  Pill,
  Dna,
  CheckCircle2,
  Flame,
  Volume2,
  VolumeX,
} from "lucide-react";
import confetti from "canvas-confetti";

type Player = "X" | "O" | null;
type GameMode = "1P_EASY" | "1P_SMART" | "2P";
type ArcadeTab = "tictactoe" | "reflex" | "memory";

// Helper for contrast colors
function getContrastColor(hexcolor: string): string {
  if (!hexcolor) return "#ffffff";
  const hex = hexcolor.replace("#", "");
  const r = parseInt(hex.substring(0, 2) || "0", 16);
  const g = parseInt(hex.substring(2, 4) || "0", 16);
  const b = parseInt(hex.substring(4, 6) || "0", 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 200 ? "#0f172a" : "#ffffff";
}

export function TicTacToe({ themeColor }: { themeColor: string }) {
  const [activeTab, setActiveTab] = useState<ArcadeTab>("tictactoe");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ── SOUND FX (Web Audio API Synthesizer) ──────────────────────────
  const playSound = useCallback((type: "click" | "win" | "match" | "fail") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "click") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "win") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "match") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "fail") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // AudioContext audio policy fallback
    }
  }, [soundEnabled]);

  return (
    <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] p-5 sm:p-6 flex flex-col relative overflow-hidden group">
      {/* Dynamic Background Glow */}
      <div
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full opacity-[0.08] blur-3xl pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      {/* Header & Game Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
              boxShadow: `0 8px 20px -5px ${themeColor}60`,
            }}
          >
            <Gamepad2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                Waiting Room Arcade
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                10/10 WOW
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">
              Pass the time with quick brain games while waiting for doctor
            </p>
          </div>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="self-end sm:self-auto p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60 transition-all active:scale-95 shrink-0"
          title={soundEnabled ? "Mute Game Sounds" : "Enable Game Sounds"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* Arcade Tabs */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-5 gap-1 relative z-10">
        <button
          onClick={() => {
            setActiveTab("tictactoe");
            playSound("click");
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "tictactoe"
              ? "bg-white text-slate-900 shadow-md scale-[1.02]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" style={{ color: activeTab === "tictactoe" ? themeColor : undefined }} />
          Zero Kaata
        </button>

        <button
          onClick={() => {
            setActiveTab("reflex");
            playSound("click");
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "reflex"
              ? "bg-white text-slate-900 shadow-md scale-[1.02]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Reflex Rush
        </button>

        <button
          onClick={() => {
            setActiveTab("memory");
            playSound("click");
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "memory"
              ? "bg-white text-slate-900 shadow-md scale-[1.02]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-indigo-500" />
          Brain Match
        </button>
      </div>

      {/* Active Mini Game Component */}
      <div className="relative z-10 w-full flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "tictactoe" && (
            <motion.div
              key="tictactoe"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TicTacToeGame themeColor={themeColor} playSound={playSound} />
            </motion.div>
          )}

          {activeTab === "reflex" && (
            <motion.div
              key="reflex"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReflexRushGame themeColor={themeColor} playSound={playSound} />
            </motion.div>
          )}

          {activeTab === "memory" && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MemoryMatchGame themeColor={themeColor} playSound={playSound} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 1: CYBER TIC-TAC-TOE (SMART AI + STREAKS + PARTICLE WIN)
// ─────────────────────────────────────────────────────────────────────────────
function TicTacToeGame({
  themeColor,
  playSound,
}: {
  themeColor: string;
  playSound: (type: "click" | "win" | "match" | "fail") => void;
}) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState<GameMode>("1P_SMART");
  const [winner, setWinner] = useState<Player | "Draw">(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [streak, setStreak] = useState(0);

  // Check for winner
  useEffect(() => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Cols
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

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
      setScores((prev) => ({ ...prev, [foundWinner as "X" | "O"]: prev[foundWinner as "X" | "O"] + 1 }));
      if (foundWinner === "X") {
        setStreak((s) => s + 1);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        playSound("win");
      } else {
        setStreak(0);
        playSound("fail");
      }
    } else if (!board.includes(null)) {
      setWinner("Draw");
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      playSound("match");
    }
  }, [board, playSound]);

  // AI Logic
  useEffect(() => {
    if ((mode === "1P_EASY" || mode === "1P_SMART") && !xIsNext && !winner) {
      const timer = setTimeout(() => {
        const available = board
          .map((v, i) => (v === null ? i : null))
          .filter((v) => v !== null) as number[];

        if (available.length === 0) return;

        let chosenIndex = available[0];

        if (mode === "1P_EASY") {
          chosenIndex = available[Math.floor(Math.random() * available.length)];
        } else {
          // SMART AI: Check if AI can win, or block player win, otherwise center/random
          const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
          ];

          // 1. Can AI win right now?
          let winMove = -1;
          let blockMove = -1;

          for (const [a, b, c] of lines) {
            const vals = [board[a], board[b], board[c]];
            if (vals.filter((v) => v === "O").length === 2 && vals.includes(null)) {
              winMove = [a, b, c][vals.indexOf(null)];
              break;
            }
            if (vals.filter((v) => v === "X").length === 2 && vals.includes(null)) {
              blockMove = [a, b, c][vals.indexOf(null)];
            }
          }

          if (winMove !== -1) {
            chosenIndex = winMove;
          } else if (blockMove !== -1) {
            chosenIndex = blockMove;
          } else if (board[4] === null) {
            chosenIndex = 4; // take center
          } else {
            chosenIndex = available[Math.floor(Math.random() * available.length)];
          }
        }

        const newBoard = [...board];
        newBoard[chosenIndex] = "O";
        setBoard(newBoard);
        setXIsNext(true);
        playSound("click");
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [xIsNext, mode, winner, board, playSound]);

  const handleClick = (index: number) => {
    if (board[index] || winner || (mode !== "2P" && !xIsNext)) return;

    playSound("click");
    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    playSound("click");
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Mode Bar + Win Streak */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 flex-wrap">
        <div className="flex gap-1">
          <button
            onClick={() => { setMode("1P_SMART"); resetGame(); }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
              mode === "1P_SMART" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            🤖 Smart AI
          </button>
          <button
            onClick={() => { setMode("1P_EASY"); resetGame(); }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
              mode === "1P_EASY" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            🌱 Easy AI
          </button>
          <button
            onClick={() => { setMode("2P"); resetGame(); }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
              mode === "2P" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            👥 2 Player
          </button>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl text-[11px] font-black border border-amber-200/80">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-bounce" />
            <span>{streak} Win Streak</span>
          </div>
        )}
      </div>

      {/* Scoreboard */}
      <div className="flex items-center justify-around w-full max-w-xs mb-4 text-xs font-black bg-slate-900 text-white py-2 px-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }} />
          <span>You (X): {scores.X}</span>
        </div>
        <span className="text-slate-500">|</span>
        <div className="text-slate-400">Draws: {scores.draws}</div>
        <span className="text-slate-500">|</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>{mode === "2P" ? "P2 (O)" : "AI (O)"}: {scores.O}</span>
        </div>
      </div>

      {/* Status turn indicator */}
      <div className="h-6 mb-3 flex items-center justify-center">
        {winner ? (
          <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            {winner === "Draw" ? "Game Draw! 🤝" : (
              <>Winner: <span style={{ color: winner === "X" ? themeColor : "#f43f5e" }}>Player {winner}</span> 🎉</>
            )}
          </span>
        ) : (
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            Turn: <strong style={{ color: xIsNext ? themeColor : "#f43f5e" }}>{xIsNext ? "Player X" : "Player O"}</strong>
          </span>
        )}
      </div>

      {/* 3x3 Board */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 w-full max-w-[270px]">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: cell || winner ? 1 : 1.05 }}
              whileTap={{ scale: cell || winner ? 1 : 0.95 }}
              onClick={() => handleClick(idx)}
              disabled={!!winner || !!cell || (mode !== "2P" && !xIsNext)}
              className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                !cell && !winner ? "bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-2 border-slate-100" : ""
              } ${cell ? "bg-white border-2 shadow-sm cursor-default" : ""}`}
              style={{
                borderColor: cell === "X" ? `${themeColor}60` : cell === "O" ? "#f43f5e60" : undefined,
                backgroundColor: isWinningCell ? (cell === "X" ? `${themeColor}20` : "#f43f5e20") : undefined,
              }}
            >
              <AnimatePresence>
                {cell === "X" && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <X className="w-9 h-9 stroke-[3]" style={{ color: themeColor }} />
                  </motion.div>
                )}
                {cell === "O" && (
                  <motion.div
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Circle className="w-8 h-8 stroke-[4]" style={{ color: "#f43f5e" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={resetGame}
        className="flex items-center gap-2 text-xs font-black text-slate-600 hover:text-slate-900 transition-all py-2.5 px-5 rounded-full bg-slate-100 hover:bg-slate-200/80 active:scale-95 shadow-xs"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Play Next Round
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 2: REFLEX RUSH (DOCTOR REACTION SPEED VITALITY TEST)
// ─────────────────────────────────────────────────────────────────────────────
function ReflexRushGame({
  themeColor,
  playSound,
}: {
  themeColor: string;
  playSound: (type: "click" | "win" | "match" | "fail") => void;
}) {
  const [gameState, setGameState] = useState<"IDLE" | "WAITING" | "READY" | "RESULTS" | "TOO_EARLY">("IDLE");
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [bestMs, setBestMs] = useState<number | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const startTest = () => {
    playSound("click");
    setGameState("WAITING");
    setReactionMs(null);

    const randomDelay = Math.floor(Math.random() * 2500) + 1500; // 1.5s - 4.0s
    const timer = setTimeout(() => {
      setGameState("READY");
      setStartTime(Date.now());
      playSound("match");
    }, randomDelay);

    setTimeoutId(timer);
  };

  const handleTap = () => {
    if (gameState === "WAITING") {
      if (timeoutId) clearTimeout(timeoutId);
      setGameState("TOO_EARLY");
      playSound("fail");
    } else if (gameState === "READY") {
      const ms = Date.now() - startTime;
      setReactionMs(ms);
      setGameState("RESULTS");
      playSound("win");

      if (!bestMs || ms < bestMs) {
        setBestMs(ms);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      }
    }
  };

  const getSpeedRating = (ms: number) => {
    if (ms < 220) return { title: "⚡ Superhuman Reflexes!", color: "text-amber-500", badge: "Doctor Level 10/10" };
    if (ms < 320) return { title: "🚀 Lightning Fast!", color: "text-emerald-600", badge: "Excellent Vitality" };
    if (ms < 450) return { title: "👍 Sharp & Steady!", color: "text-blue-600", badge: "Good Response" };
    return { title: "😴 Relaxed Pace", color: "text-slate-600", badge: "Normal Pace" };
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4">
        <h4 className="font-black text-slate-900 text-sm flex items-center justify-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" /> Brain Reflex & Reaction Test
        </h4>
        <p className="text-[11px] text-slate-400 font-semibold">
          Tap as FAST as you can when the box turns GREEN!
        </p>
      </div>

      {/* Main Interactive Reflex Box */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={gameState === "WAITING" || gameState === "READY" ? handleTap : undefined}
        className={`w-full max-w-sm h-48 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-lg relative overflow-hidden select-none ${
          gameState === "IDLE"
            ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
            : gameState === "WAITING"
            ? "bg-amber-500 text-white animate-pulse"
            : gameState === "READY"
            ? "bg-emerald-500 text-white shadow-emerald-500/40"
            : gameState === "TOO_EARLY"
            ? "bg-rose-500 text-white"
            : "bg-slate-900 text-white"
        }`}
      >
        {gameState === "IDLE" && (
          <div onClick={startTest} className="w-full h-full flex flex-col items-center justify-center">
            <Zap className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <p className="font-black text-base">Tap to Start Reaction Test</p>
            <p className="text-xs text-slate-400 mt-1">Test your brain speed in milliseconds</p>
          </div>
        )}

        {gameState === "WAITING" && (
          <div className="space-y-2">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-black text-lg">Wait for GREEN...</p>
            <p className="text-xs text-white/80">Don't tap too early!</p>
          </div>
        )}

        {gameState === "READY" && (
          <div className="space-y-1">
            <Sparkles className="w-12 h-12 text-white mx-auto animate-ping" />
            <p className="font-black text-3xl tracking-tight">TAP NOW! 💥</p>
          </div>
        )}

        {gameState === "TOO_EARLY" && (
          <div className="space-y-2">
            <X className="w-12 h-12 text-white mx-auto" />
            <p className="font-black text-xl">Too Early! ⚠️</p>
            <p className="text-xs text-white/90">Wait until the background turns GREEN.</p>
          </div>
        )}

        {gameState === "RESULTS" && reactionMs && (
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Score</p>
            <p className="text-5xl font-black text-emerald-400 tracking-tighter">{reactionMs} <span className="text-xl">ms</span></p>
            <p className={`text-sm font-black mt-1 ${getSpeedRating(reactionMs).color}`}>
              {getSpeedRating(reactionMs).title}
            </p>
          </div>
        )}
      </motion.div>

      {/* Best Score & Retry */}
      <div className="mt-5 flex items-center justify-between w-full max-w-sm px-2">
        <div className="text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Personal Best</span>
          <span className="text-sm font-black text-slate-800">
            {bestMs ? `${bestMs} ms 🏆` : "-- ms"}
          </span>
        </div>

        {gameState !== "IDLE" && (
          <button
            onClick={startTest}
            className="flex items-center gap-1.5 text-xs font-black text-white px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 3: MEDICAL MEMORY MATCH (FLIP CARDS + BRAIN TRAINER)
// ─────────────────────────────────────────────────────────────────────────────
interface CardItem {
  id: number;
  icon: any;
  label: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function MemoryMatchGame({
  themeColor,
  playSound,
}: {
  themeColor: string;
  playSound: (type: "click" | "win" | "match" | "fail") => void;
}) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initGame = useCallback(() => {
    const items = [
      { label: "Stethoscope", icon: Stethoscope, color: "text-blue-500" },
      { label: "Pill", icon: Pill, color: "text-amber-500" },
      { label: "Heart", icon: Heart, color: "text-rose-500" },
      { label: "DNA", icon: Dna, color: "text-purple-500" },
    ];

    const deck: CardItem[] = [];
    items.forEach((item, idx) => {
      deck.push({ id: idx * 2, ...item, isFlipped: false, isMatched: false });
      deck.push({ id: idx * 2 + 1, ...item, isFlipped: false, isMatched: false });
    });

    // Shuffle deck
    deck.sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length === 2) return;

    playSound("click");
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].label === cards[secondIdx].label) {
        // Matched!
        setTimeout(() => {
          playSound("match");
          updatedCards[firstIdx].isMatched = true;
          updatedCards[secondIdx].isMatched = true;
          setCards([...updatedCards]);
          setFlippedCards([]);

          if (updatedCards.every((c) => c.isMatched)) {
            setIsWon(true);
            playSound("win");
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
          }
        }, 300);
      } else {
        // No match - Flip back
        setTimeout(() => {
          updatedCards[firstIdx].isFlipped = false;
          updatedCards[secondIdx].isFlipped = false;
          setCards([...updatedCards]);
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-between w-full max-w-xs mb-4">
        <div>
          <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-500" /> Medical Memory Match
          </h4>
          <p className="text-[11px] text-slate-400 font-semibold">Match pairs of clinical icons</p>
        </div>

        <div className="bg-slate-100 px-3 py-1 rounded-xl text-xs font-black text-slate-700">
          Moves: {moves}
        </div>
      </div>

      {/* 4x2 Grid */}
      <div className="grid grid-cols-4 gap-2.5 w-full max-w-xs mb-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(idx)}
              className={`aspect-square rounded-2xl flex items-center justify-center border-2 transition-all duration-300 relative ${
                card.isFlipped || card.isMatched
                  ? "bg-white border-slate-200 shadow-md"
                  : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-500"
              } ${card.isMatched ? "border-emerald-300 bg-emerald-50/50 opacity-90" : ""}`}
            >
              {card.isFlipped || card.isMatched ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <Icon className={`w-7 h-7 ${card.color}`} />
                </motion.div>
              ) : (
                <Sparkles className="w-5 h-5 text-slate-500" />
              )}
            </motion.button>
          );
        })}
      </div>

      {isWon ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl w-full max-w-xs mb-3 space-y-1">
          <p className="font-black text-sm">🎉 Brain Mastered in {moves} moves!</p>
          <p className="text-[11px] font-semibold">Your focus memory score is 100% sharp.</p>
        </div>
      ) : null}

      <button
        onClick={() => {
          playSound("click");
          initGame();
        }}
        className="flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-slate-900 transition-all py-2.5 px-5 rounded-full bg-slate-100 hover:bg-slate-200/80 active:scale-95"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Shuffle & Restart
      </button>
    </div>
  );
}
