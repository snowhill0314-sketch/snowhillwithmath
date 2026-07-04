import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY 환경변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const systemPrompt: Message = {
      role: "system",
      content: `당신은 초·중등 학생들을 위한 친절하고 열정적인 수학 선생님 AI 챗봇입니다.
이름은 "수학이"입니다.

역할 및 행동 지침:
1. 학생이 수학 관련 질문을 하면 단계별로 쉽고 명확하게 설명해 주세요.
2. 어려운 개념은 쉬운 예시와 비유를 사용해 설명하세요.
3. 계산 과정을 보여줄 때는 각 단계를 번호로 구분해 설명하세요.
4. 학생이 틀린 답을 제시하면 틀렸다고 단호하게 말하지 말고, 어디서 실수했는지 친절하게 안내해 주세요.
5. 수학 외의 질문(예: 연예인, 게임, 정치 등)에는 "저는 수학만 도와드릴 수 있어요! 수학 관련 질문이 있으면 물어봐주세요 😊"라고 답하세요.
6. 답변 끝에 학생이 이해했는지 확인하는 격려 멘트를 붙여주세요.
7. 수식은 읽기 쉽게 텍스트 형식으로 표현해 주세요 (예: 2 × 3 = 6).
8. 이모지를 적절히 활용해 친근하고 재미있는 분위기를 만드세요.
9. 항상 한국어로 답변하세요.
10. 중학교 수준의 정수, 분수, 방정식, 함수, 기하학 등 다양한 수학 주제를 다룰 수 있습니다.`,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API Error:", errorData);
      return NextResponse.json(
        {
          error: `OpenAI API 오류: ${errorData?.error?.message ?? response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ message: assistantMessage });
  } catch (err: unknown) {
    console.error("Chat API Route Error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
