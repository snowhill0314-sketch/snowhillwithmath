-- 1. 정수 덧셈/뺄셈 수직선 시뮬레이션 결과 및 이력 기록용 테이블 생성
CREATE TABLE IF NOT EXISTS public.math_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equation TEXT NOT NULL,          -- 수식 전체 텍스트 (예: "2 - (-3) = 5")
    start_val INTEGER NOT NULL,      -- 시작 위치 A (예: 2)
    operator VARCHAR(1) NOT NULL,    -- 연산자 (+ 또는 -)
    operand_val INTEGER NOT NULL,    -- 피연산자 B (예: -3)
    final_pos INTEGER NOT NULL,      -- 최종 도달 위치 (예: 5)
    steps JSONB NOT NULL,            -- 상세 시뮬레이션 단계 기록 (각 지점의 좌표, 바라보는 방향 등)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 보안을 위해 Row Level Security(RLS) 활성화
ALTER TABLE public.math_movements ENABLE ROW LEVEL SECURITY;

-- 3. 모든 사용자가 데이터를 조회(Select)할 수 있도록 허용하는 정책 생성
CREATE POLICY "Allow public read access" 
ON public.math_movements 
FOR SELECT 
USING (true);

-- 4. 모든 사용자가 데이터를 추가(Insert)할 수 있도록 허용하는 정책 생성
CREATE POLICY "Allow public insert access" 
ON public.math_movements 
FOR INSERT 
WITH CHECK (true);
