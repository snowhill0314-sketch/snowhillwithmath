"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  RotateCcw, 
  SkipForward, 
  Trash2, 
  History, 
  Sparkles, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  ArrowRightLeft
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// 2D Character SVG Component
const CharacterSVG = ({ 
  isWalking, 
  color = "rgb(99, 102, 241)" 
}: { 
  isWalking: boolean; 
  color?: string;
}) => {
  return (
    <svg 
      width="60" 
      height="70" 
      viewBox="0 0 60 70" 
      fill="none" 
      className={`select-none ${isWalking ? "animate-walk-bob" : ""}`}
    >
      {/* Hair / Cap */}
      <rect x="18" y="8" width="24" height="8" rx="4" fill="#374151" />
      {/* Head */}
      <circle cx="30" cy="24" r="12" fill="#FEE2E2" stroke="#374151" strokeWidth="2.5" />
      
      {/* Eyes (facing Right by default; scaleX(-1) on parent will mirror) */}
      <circle cx="35" cy="21" r="2" fill="#111827" />
      <circle cx="41" cy="21" r="2" fill="#111827" />
      
      {/* Blushing cheek */}
      <circle cx="38" cy="26" r="2" fill="#F43F5E" opacity="0.6" />
      
      {/* Smile */}
      <path 
        d="M 35 27 Q 38 29 40 27" 
        stroke="#111827" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        fill="none" 
      />
      
      {/* Body / Shirt */}
      <rect x="19" y="36" width="22" height="18" rx="6" fill={color} stroke="#374151" strokeWidth="2.5" />
      
      {/* Symbol on shirt: Math symbol */}
      <circle cx="30" cy="45" r="4.5" fill="#FFFFFF" opacity="0.9" />
      <path d="M 28 45 L 32 45 M 30 43 L 30 47" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
      
      {/* Legs (swing animation applied via className) */}
      {/* Left Leg */}
      <g className={isWalking ? "origin-[30px_54px] animate-[leg-swing-left_0.4s_ease-in-out_infinite]" : ""}>
        <rect 
          x="23" 
          y="54" 
          width="5.5" 
          height="12" 
          rx="2.5" 
          fill="#374151" 
        />
        {/* Foot */}
        <ellipse cx="27" cy="65" rx="4" ry="2" fill="#1F2937" />
      </g>
      
      {/* Right Leg */}
      <g className={isWalking ? "origin-[30px_54px] animate-[leg-swing-right_0.4s_ease-in-out_infinite]" : ""}>
        <rect 
          x="31.5" 
          y="54" 
          width="5.5" 
          height="12" 
          rx="2.5" 
          fill="#374151" 
        />
        {/* Foot */}
        <ellipse cx="35.5" cy="65" rx="4" ry="2" fill="#1F2937" />
      </g>
    </svg>
  );
};

interface HistoryRecord {
  id: string;
  equation: string;
  start_val: number;
  operator: string;
  operand_val: number;
  final_pos: number;
  created_at: string;
}

export default function MathSimulatorPage() {
  // Input states
  const [startVal, setStartVal] = useState<number>(2);
  const [operator, setOperator] = useState<string>("-");
  const [operandVal, setOperandVal] = useState<number>(-3);

  // Simulation run states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepDesc, setStepDesc] = useState<string>("준비 완료! [시뮬레이션 시작] 또는 [한 단계씩 실행] 버튼을 눌러보세요.");
  const [stepAction, setStepAction] = useState<string>("");

  // Character physical representation states
  const [characterPos, setCharacterPos] = useState<number>(0);
  const [characterFacing, setCharacterFacing] = useState<"right" | "left">("right");
  const [isWalking, setIsWalking] = useState<boolean>(false);

  // History & DB states
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Animation controller ref
  const animRef = useRef<number | null>(null);
  const abortControllerRef = useRef<boolean>(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Calculate destination positions
  const getDestination = (start: number, op: string, operand: number) => {
    return op === "+" ? start + operand : start - operand;
  };

  const finalPos = getDestination(startVal, operator, operandVal);

  // Load calculation history
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    setDbError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("math_movements")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        setHistory(data || []);
      } else {
        const localHistory = JSON.parse(localStorage.getItem("math_history") || "[]");
        setHistory(localHistory.slice(0, 10));
      }
    } catch (err: any) {
      console.error("DB Load Error, fallback to localStorage:", err);
      setDbError("Supabase 데이터 조회 오류. 로컬 임시 저장소를 불러옵니다.");
      const localHistory = JSON.parse(localStorage.getItem("math_history") || "[]");
      setHistory(localHistory.slice(0, 10));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Save result to Supabase or LocalStorage
  const saveToDatabase = async (finalPosition: number) => {
    const equationText = `${startVal} ${operator} (${operandVal >= 0 ? "+" : ""}${operandVal}) = ${finalPosition}`;
    const record = {
      equation: equationText,
      start_val: startVal,
      operator: operator,
      operand_val: operandVal,
      final_pos: finalPosition,
      steps: {
        initial_facing: "right",
        step_1_pos: startVal,
        step_2_facing: operator === "-" ? "left" : "right",
        step_3_pos: finalPosition
      }
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("math_movements").insert([record]);
        if (error) throw error;
      } else {
        const localHistory = JSON.parse(localStorage.getItem("math_history") || "[]");
        const newRecord = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...record
        };
        localStorage.setItem("math_history", JSON.stringify([newRecord, ...localHistory]));
      }
      await loadHistory();
    } catch (err: any) {
      console.error("DB Save Error:", err);
      // Fallback save in localStorage anyway
      const localHistory = JSON.parse(localStorage.getItem("math_history") || "[]");
      const newRecord = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...record
      };
      localStorage.setItem("math_history", JSON.stringify([newRecord, ...localHistory]));
      setHistory([newRecord, ...localHistory].slice(0, 10));
      setDbError("DB 저장 실패. 기록이 임시(로컬)로 저장되었습니다.");
    }
  };

  // Delete a specific history log
  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("math_movements").delete().eq("id", id);
        if (error) throw error;
      } else {
        const localHistory = JSON.parse(localStorage.getItem("math_history") || "[]");
        const updated = localHistory.filter((item: any) => item.id !== id);
        localStorage.setItem("math_history", JSON.stringify(updated));
      }
      await loadHistory();
    } catch (err: any) {
      console.error("Failed to delete log:", err);
      setDbError("기록 삭제 중 오류 발생");
    }
  };

  // Clear all history logs
  const clearAllHistory = async () => {
    if (!confirm("모든 학습 기록을 초기화하시겠습니까?")) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("math_movements").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) throw error;
      } else {
        localStorage.removeItem("math_history");
      }
      await loadHistory();
    } catch (err: any) {
      console.error("Failed to clear history:", err);
      setDbError("전체 기록 삭제 오류");
    }
  };

  // Helper delay
  const delay = (ms: number) => {
    return new Promise<void>((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve();
      }, ms);
      
      // Allow aborting during delay
      const checkAbort = setInterval(() => {
        if (abortControllerRef.current) {
          clearTimeout(timeoutId);
          clearInterval(checkAbort);
          resolve();
        }
      }, 50);
    });
  };

  // Linear Interpolation Movement Animation
  const animateMove = (from: number, to: number) => {
    return new Promise<void>((resolve) => {
      const duration = 1500; // 1.5 seconds for walking
      const startTime = performance.now();

      const tick = (now: number) => {
        if (abortControllerRef.current) {
          setCharacterPos(to);
          resolve();
          return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: easeInOutQuad
        const ease = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const current = from + (to - from) * ease;
        setCharacterPos(current);

        if (progress < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          setCharacterPos(to);
          resolve();
        }
      };

      animRef.current = requestAnimationFrame(tick);
    });
  };

  // Run whole simulation sequentially
  const handleStartSimulation = async (sVal = startVal, op = operator, oVal = operandVal) => {
    // Reset previous states
    if (isPlaying) {
      // Abort previous run
      abortControllerRef.current = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      await new Promise((r) => setTimeout(r, 150));
    }
    
    abortControllerRef.current = false;
    setIsPlaying(true);
    
    // Step 0: Initial State
    setCurrentStep(0);
    setCharacterPos(0);
    setCharacterFacing("right");
    setIsWalking(false);
    setStepDesc("수직선 0 위치에 오른쪽(+)을 바라보고 사람이 섭니다.");
    setStepAction("대기");
    await delay(1600);
    if (abortControllerRef.current) return;

    // Step 1: Move to Start Value (A)
    setCurrentStep(1);
    const movingDirection = sVal >= 0 ? "앞으로 (오른쪽)" : "뒷걸음으로 (왼쪽)";
    setStepDesc(`1단계: 시작 위치 ${sVal}로 이동합니다. ${sVal >= 0 ? "양의 정수(+)이므로 몸이 바라보는 방향 그대로 앞으로" : "음의 정수(-)이므로 뒤돌지 않고 뒷걸음으로"} 움직입니다.`);
    setStepAction(sVal >= 0 ? "앞으로 걷기" : "뒷걸음질");
    setIsWalking(true);
    await animateMove(0, sVal);
    setIsWalking(false);
    await delay(1200);
    if (abortControllerRef.current) return;

    // Step 2: Apply Operator (op)
    setCurrentStep(2);
    if (op === "-") {
      setStepDesc("2단계: 뺄셈(-) 연산입니다. 몸의 방향을 반대로 뒤집습니다!");
      setStepAction("뒤집기");
      // Add a small rotation effect
      setCharacterFacing("left");
    } else {
      setStepDesc("2단계: 덧셈(+) 연산입니다. 몸의 방향을 유지합니다.");
      setStepAction("방향 유지");
    }
    await delay(1600);
    if (abortControllerRef.current) return;

    // Step 3: Move by Operand Value (B)
    setCurrentStep(3);
    const dest = getDestination(sVal, op, oVal);
    // If operand is positive, walk forward. If negative, walk backward.
    const isBPositive = oVal >= 0;
    setStepDesc(`3단계: 피연산자 ${oVal >= 0 ? "+" : ""}${oVal}만큼 움직입니다. ${isBPositive ? "양의 정수(+)이므로 바라보는 방향 기준 앞으로" : "음의 정수(-)이므로 바라보는 방향 기준 뒷걸음으로"} 걷습니다.`);
    setStepAction(isBPositive ? "앞으로 걷기" : "뒷걸음질");
    setIsWalking(true);
    await animateMove(sVal, dest);
    setIsWalking(false);
    await delay(1200);
    if (abortControllerRef.current) return;

    // Step 4: Finished
    setCurrentStep(4);
    setStepDesc(`시뮬레이션 완료! 최종 위치는 ${dest}입니다. 식: ${sVal} ${op} (${oVal >= 0 ? "+" : ""}${oVal}) = ${dest}`);
    setStepAction("완료");
    
    // Save to Database
    await saveToDatabase(dest);
    setIsPlaying(false);
  };

  // Step-by-Step execution handler (Interactive manual stepping)
  const handleNextStepManual = async () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setCurrentStep(0);
      setCharacterPos(0);
      setCharacterFacing("right");
      setIsWalking(false);
      setStepDesc("수직선 0 위치에 오른쪽(+)을 바라보고 섭니다. 다음 단계(>) 버튼을 눌러 첫 동작을 시작하세요.");
      setStepAction("대기");
      return;
    }

    if (currentStep === 0) {
      setCurrentStep(1);
      setStepDesc(`1단계: 시작 위치 ${startVal}로 이동합니다. ${startVal >= 0 ? "양의 정수(+)이므로 앞으로" : "음의 정수(-)이므로 뒷걸음으로"} 움직입니다.`);
      setStepAction(startVal >= 0 ? "앞으로 걷기" : "뒷걸음질");
      setIsWalking(true);
      await animateMove(0, startVal);
      setIsWalking(false);
    } else if (currentStep === 1) {
      setCurrentStep(2);
      if (operator === "-") {
        setStepDesc("2단계: 뺄셈(-) 연산입니다. 몸의 방향을 반대로 뒤집습니다!");
        setStepAction("뒤집기");
        setCharacterFacing("left");
      } else {
        setStepDesc("2단계: 덧셈(+) 연산입니다. 몸의 방향을 그대로 유지합니다.");
        setStepAction("방향 유지");
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
      const dest = getDestination(startVal, operator, operandVal);
      const isBPositive = operandVal >= 0;
      setStepDesc(`3단계: 피연산자 ${operandVal >= 0 ? "+" : ""}${operandVal}만큼 움직입니다. ${isBPositive ? "양의 정수(+)이므로 바라보는 방향 기준 앞으로" : "음의 정수(-)이므로 바라보는 방향 기준 뒷걸음으로"} 걷습니다.`);
      setStepAction(isBPositive ? "앞으로 걷기" : "뒷걸음질");
      setIsWalking(true);
      await animateMove(startVal, dest);
      setIsWalking(false);
    } else if (currentStep === 3) {
      setCurrentStep(4);
      setStepDesc(`시뮬레이션 완료! 최종 위치는 ${finalPos}입니다. 식: ${startVal} ${operator} (${operandVal >= 0 ? "+" : ""}${operandVal}) = ${finalPos}`);
      setStepAction("완료");
      await saveToDatabase(finalPos);
      setIsPlaying(false);
    }
  };

  // Replay a logic from history
  const handleReplay = (item: HistoryRecord) => {
    setStartVal(item.start_val);
    setOperator(item.operator);
    setOperandVal(item.operand_val);
    handleStartSimulation(item.start_val, item.operator, item.operand_val);
  };

  // Reset to initial
  const handleReset = () => {
    abortControllerRef.current = true;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
    setCharacterPos(0);
    setCharacterFacing("right");
    setIsWalking(false);
    setStepDesc("준비 완료! [시뮬레이션 시작] 또는 [한 단계씩 실행] 버튼을 눌러보세요.");
    setStepAction("");
  };

  // Translate character coordinate to percentage (-10 to +10 -> 0% to 100%)
  const minPos = -10;
  const maxPos = 10;
  const range = maxPos - minPos;
  const characterPercent = ((characterPos - minPos) / range) * 100;

  // Generate numbers for scale ticks
  const ticks = [];
  for (let i = minPos; i <= maxPos; i++) {
    ticks.push(i);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
            <Sparkles className="h-3 w-3" />
            <span>수학 시각화 교육 도구</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            정수만큼 움직이기!
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            사람의 몸 방향과 걷는 방향(전진/후진)을 활용하여 정수의 덧셈과 뺄셈의 원리를 쉽게 체험해 보세요.
          </p>
        </div>

        {/* Supabase Status Indicator */}
        <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-200/80 px-4 py-2.5 text-sm font-medium shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300">
          {isSupabaseConfigured ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Database className="h-4 w-4 text-emerald-500" />
              <span>Supabase Cloud 연동 중</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <Database className="h-4 w-4 text-amber-500" />
              <span>로컬 저장소 활성화 (Offline Mock)</span>
            </>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Simulator (2 spans wide) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Simulation Playground Canvas */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/60 relative overflow-hidden flex flex-col gap-8 min-h-[380px]">
            {/* Visual background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl -z-10 dark:bg-indigo-900/10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100/30 rounded-full blur-3xl -z-10 dark:bg-rose-900/10" />

            {/* Stage Indicator & Speech Bubble */}
            <div className="flex justify-between items-start gap-4">
              {/* Step info badge */}
              <div className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                단계: {currentStep === 0 ? "대기" : `${currentStep}단계`} {stepAction && `[${stepAction}]`}
              </div>
              
              {/* Character Speech Bubble */}
              <div className="relative bg-indigo-50 border border-indigo-100 text-indigo-900 px-4 py-2 rounded-xl text-sm font-medium max-w-[280px] sm:max-w-[360px] dark:bg-indigo-950/50 dark:border-indigo-900/40 dark:text-indigo-200 shadow-sm animate-pulse">
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-indigo-50 border-r border-b border-indigo-100 transform rotate-45 dark:bg-indigo-950/50 dark:border-indigo-900/40"></div>
                {currentStep === 0 && "안녕! 나는 0에서 출발할 준비를 하고 있어."}
                {currentStep === 1 && `시작 값 ${startVal}을 향해 ${startVal >= 0 ? "앞으로" : "뒷걸음으로"} 걷는 중!`}
                {currentStep === 2 && (operator === "-" ? "뺄셈이다! 몸을 뒤집어서 반대쪽을 볼게!" : "덧셈이다! 보는 방향을 유지할게.")}
                {currentStep === 3 && `피연산자 ${operandVal}만큼 ${operandVal >= 0 ? "앞으로" : "뒤로"} 갈게!`}
                {currentStep === 4 && `목적지인 ${finalPos}에 무사히 도착했어!`}
              </div>
            </div>

            {/* The Visual Number Line Canvas */}
            <div className="relative mt-8 mb-6 py-10 px-4 border-y border-zinc-100 dark:border-zinc-800">
              
              {/* Region highlight bands */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-8 rounded-lg flex overflow-hidden opacity-10">
                <div className="w-1/2 h-full bg-rose-500" />
                <div className="w-[2px] h-full bg-zinc-900" />
                <div className="w-1/2 h-full bg-indigo-500" />
              </div>

              {/* Number Line Track */}
              <div className="relative h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center">
                {/* Zero point mark */}
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full z-10 border-2 border-white dark:border-zinc-900" />
                
                {/* Math path trace line */}
                {/* 0 to startVal path */}
                {currentStep >= 1 && (
                  <div 
                    className="absolute h-1 bg-rose-400/80 border-dashed border-t-2 border-rose-500 z-0"
                    style={{
                      left: `${Math.min(50, ((startVal + 10) / 20) * 100)}%`,
                      width: `${Math.abs(startVal) * 5}%`
                    }}
                  />
                )}
                {/* startVal to finalPos path */}
                {currentStep >= 3 && (
                  <div 
                    className="absolute h-1.5 bg-indigo-500 dark:bg-indigo-400 z-0 rounded-full"
                    style={{
                      left: `${Math.min(((startVal + 10) / 20) * 100, ((characterPos + 10) / 20) * 100)}%`,
                      width: `${Math.abs(characterPos - startVal) * 5}%`
                    }}
                  />
                )}
              </div>

              {/* Tick Marks & Labels */}
              <div className="relative w-full flex justify-between px-[-2px] mt-4">
                {ticks.map((tick) => {
                  const isZero = tick === 0;
                  const isStart = tick === startVal;
                  const isFinal = tick === finalPos && currentStep >= 3;
                  return (
                    <div 
                      key={tick} 
                      className="absolute flex flex-col items-center -translate-x-1/2" 
                      style={{ left: `${((tick + 10) / 20) * 100}%` }}
                    >
                      {/* Tick mark */}
                      <div className={`w-0.5 h-3 ${isZero ? "h-4 bg-purple-600 dark:bg-purple-400 w-1" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                      
                      {/* Label Text */}
                      <span 
                        className={`text-xs mt-1.5 font-bold transition-all duration-200 ${
                          isZero 
                            ? "text-purple-600 dark:text-purple-400 scale-110" 
                            : isFinal
                            ? "text-indigo-600 dark:text-indigo-400 scale-125 underline decoration-2"
                            : isStart && currentStep >= 1
                            ? "text-rose-600 dark:text-rose-400 scale-110"
                            : "text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        {tick}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Character representation */}
              <div 
                className="absolute top-0 char-transition select-none z-20"
                style={{ 
                  left: `calc(${characterPercent}% - 30px)`,
                  transform: `scaleX(${characterFacing === "left" ? -1 : 1})`,
                }}
              >
                <CharacterSVG isWalking={isWalking} />
                
                {/* Head Arrow indicator indicating direction */}
                <div 
                  className={`absolute -top-4 right-1 px-1.5 py-0.5 bg-zinc-800 text-white rounded text-[9px] font-bold shadow-md transform ${
                    characterFacing === "left" ? "rotate-180" : ""
                  }`}
                  style={{ transformOrigin: "center" }}
                >
                  ➔
                </div>
              </div>
            </div>

            {/* Instruction guidance banner */}
            <div className="mt-auto rounded-xl bg-zinc-50 p-4 border border-zinc-100 dark:bg-zinc-800/40 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">단계별 움직임 설명</h4>
              <p className="mt-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {stepDesc}
              </p>
            </div>
          </div>

          {/* Equation Input & Control Board */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/60 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              수식 설계 보드
            </h3>

            {/* Interactive Equation Preview */}
            <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xl font-extrabold shadow-inner">
              <div className="rounded-lg bg-rose-50 px-4 py-2.5 text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/20">
                {startVal >= 0 ? `+${startVal}` : startVal}
              </div>
              <div className="text-zinc-400 text-2xl">{operator}</div>
              <div className="rounded-lg bg-indigo-50 px-4 py-2.5 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/20">
                ({operandVal >= 0 ? `+${operandVal}` : operandVal})
              </div>
              <div className="text-zinc-400 text-2xl">=</div>
              <div className="rounded-lg bg-purple-500 px-5 py-2.5 text-white shadow-md">
                {isPlaying ? "?" : finalPos}
              </div>
            </div>

            {/* Control Inputs */}
            <div className="flex flex-col gap-6">
              
              {/* Start Value (A) Buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  시작 위치 선택 (A)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => !isPlaying && setStartVal(val)}
                      disabled={isPlaying}
                      className={`h-9 w-9 text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                        startVal === val
                          ? "bg-rose-500 text-white shadow-md scale-105"
                          : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-850 dark:hover:bg-zinc-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {val >= 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operator Toggle Buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-500"></span>
                  연산 기호 선택 (덧셈 / 뺄셈)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => !isPlaying && setOperator("+")}
                    disabled={isPlaying}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                      operator === "+"
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-md scale-[1.02]"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 hover:bg-zinc-100"
                    } disabled:opacity-50`}
                  >
                    <ArrowRight className="h-4 w-4" />
                    + (덧셈: 바라보는 방향 유지)
                  </button>
                  <button
                    onClick={() => !isPlaying && setOperator("-")}
                    disabled={isPlaying}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                      operator === "-"
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-md scale-[1.02]"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 hover:bg-zinc-100"
                    } disabled:opacity-50`}
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    - (뺄셈: 몸의 방향 뒤집기)
                  </button>
                </div>
              </div>

              {/* Operand Value (B) Buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  움직일 정수 크기 선택 (B)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => !isPlaying && setOperandVal(val)}
                      disabled={isPlaying}
                      className={`h-9 w-9 text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                        operandVal === val
                          ? "bg-indigo-500 text-white shadow-md scale-105"
                          : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-850 dark:hover:bg-zinc-700"
                      } disabled:opacity-50`}
                    >
                      {val >= 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Run controls */}
            <div className="flex flex-col sm:flex-row gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <button
                onClick={() => handleStartSimulation()}
                className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Play className="mr-2 h-4 w-4 fill-white" />
                시뮬레이션 시작 (Auto Play)
              </button>
              
              <button
                onClick={handleNextStepManual}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 px-5 text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                {currentStep === 4 || !isPlaying ? "한 단계씩 시작" : "다음 단계로 (>)"}
              </button>

              <button
                onClick={handleReset}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 dark:border-zinc-850 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                title="초기화"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar (DB History & Logs) */}
        <div className="flex flex-col gap-6">
          
          {/* History Panel */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/60 flex flex-col gap-6 flex-1 min-h-[450px]">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <History className="h-5 w-5 text-zinc-500" />
                계산 및 이동 기록
              </h3>
              {history.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  전체 삭제
                </button>
              )}
            </div>

            {dbError && (
              <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-3 text-xs text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{dbError}</p>
                </div>
              </div>
            )}

            {/* List */}
            {isLoadingHistory ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 text-sm gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                <span>기록 불러오는 중...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 text-sm py-16 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl gap-3">
                <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center text-zinc-300">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">저장된 기록이 없습니다</p>
                  <p className="text-xs mt-1">시뮬레이션을 완료하면 결과가 자동으로 데이터베이스에 기록됩니다.</p>
                </div>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto max-h-[350px] pr-1 flex flex-col gap-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleReplay(item)}
                    className="group rounded-xl border border-zinc-100 p-3.5 hover:border-indigo-200/80 hover:bg-indigo-50/10 dark:border-zinc-800/80 dark:hover:border-indigo-900/30 dark:hover:bg-indigo-950/10 transition-all duration-200 flex items-center justify-between cursor-pointer shadow-sm relative overflow-hidden"
                  >
                    {/* Small left color band based on equation final pos */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.final_pos >= 0 ? "bg-emerald-400" : "bg-rose-400"}`} />
                    
                    <div className="pl-2.5">
                      <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                        {item.equation}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                        {new Date(item.created_at).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 px-2 py-0.5 rounded dark:bg-indigo-950/50">
                        재생
                      </span>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="h-8 w-8 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center cursor-pointer"
                        title="기록 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supabase SQL Copier Guide */}
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">데이터베이스 연동 방법</h4>
            </div>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              프로젝트 루트에 있는 <a href="file:///c:/Users/User/Desktop/math/supabase_schema.sql" className="text-indigo-500 hover:underline">supabase_schema.sql</a> 파일의 쿼리문을 복사하여 Supabase SQL Editor에서 실행하시면 테이블 구성이 완료됩니다.
            </p>
            
            <a
              href="file:///c:/Users/User/Desktop/math/supabase_schema.sql"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all cursor-pointer text-center"
            >
              SQL 스키마 파일 열기
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
