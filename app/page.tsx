import React from "react";

export default function Home() {
  return (
    <div className="relative flex flex-col flex-1 items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      {/* Decorative background glows */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[300px] w-[300px] rounded-full bg-indigo-400/20 blur-[80px] dark:bg-indigo-500/10 sm:h-[400px] sm:w-[400px]" />
        <div className="ml-16 h-[250px] w-[250px] rounded-full bg-pink-400/20 blur-[80px] dark:bg-pink-500/10 sm:h-[350px] sm:w-[350px]" />
      </div>

      <div className="w-full max-w-3xl text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50/80 px-3 py-1 text-sm font-medium text-indigo-600 backdrop-blur-sm dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
          <span>✨ 교사 및 학생을 위한 맞춤형 템플릿</span>
        </div>

        {/* Heading */}
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white leading-[1.2]">
          나만의{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            교육용 웹앱
          </span>{" "}
          만들기
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-xl">
          에듀메이커와 함께라면 코딩을 잘 모르는 선생님도, 학생도 
          단 몇 분 만에 직관적이고 아름다운 교육 도구를 직접 구축할 수 있습니다.
        </p>

        {/* Call to Actions / Placeholder Button */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            type="button"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105 active:scale-95 dark:from-indigo-600 dark:to-purple-700 dark:shadow-indigo-900/30 cursor-pointer"
          >
            {/* Hover reflection effect */}
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <span className="flex items-center gap-2">
              퀴즈 도구 추가하기 
              <span className="transition-transform duration-300 group-hover:translate-x-1">🚀</span>
            </span>
          </button>

          <a
            href="https://github.com/snowhill0314-sketch/snowhillwithmath"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-white/60 px-6 text-sm font-semibold text-zinc-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer"
          >
            GitHub 저장소 보기
          </a>
        </div>

        {/* Grid features helper for extension */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 w-full text-left">
          <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-lg">💡</div>
            <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">직관적인 화면</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">학습 목적에 최적화된 심플하고 깔끔한 UI를 제공합니다.</p>
          </div>
          <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold text-lg">📱</div>
            <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">강력한 반응형</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">스마트폰, 태블릿, PC 등 모든 디바이스에서 완벽히 연동됩니다.</p>
          </div>
          <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-bold text-lg">⚡</div>
            <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">간편한 확장성</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">초보 선생님들도 코드를 조금씩 수정하여 새로운 기능을 얹을 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
