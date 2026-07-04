import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EduMaker - 나만의 교육용 웹앱 만들기",
  description: "선생님들과 학생들을 위한 쉽고 간편한 교육용 웹앱 템플릿",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-zinc-50 font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-colors duration-300">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
                EduMaker
              </span>
              <span className="hidden sm:inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                Beta
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                소개
              </a>
              <a href="#" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                학습 도구
              </a>
              <a href="#" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                커뮤니티
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="#"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-200 active:scale-95"
              >
                시작하기
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950 transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              &copy; {new Date().getFullYear()} EduMaker. All rights reserved.
            </p>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              선생님들의 첫 코딩 동반자, 에듀메이커와 함께 만들어가는 교육의 미래
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
