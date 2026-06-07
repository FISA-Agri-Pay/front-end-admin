import { useRef, useState } from 'react';

const recommendedPrompts = [
  { tone: 'green', label: '심사 대기 12건 요약해줘' },
  { tone: 'red', label: '연체 위험 고객 현황 알려줘' },
  { tone: 'blue', label: '오늘 BNPL 이용 현황 알려줘' },
  { tone: 'purple', label: '관리자 Action 우선순위 정리해줘' },
];

const recentChats = [
  { title: '심사 대기 12건 요약해줘', time: '10:28' },
  { title: '연체 위험 고객 현황 알려줘', time: '10:15' },
  { title: '최근 이상 주문 분석해줘', time: '어제' },
];

const cannedResponses = {
  '심사 대기 12건 요약해줘': '현재 심사 대기 12건 중 신규 고객 7건, 기존 고객 증액 요청 5건입니다. 금액이 큰 3건부터 확인하는 것을 권장합니다.',
  '연체 위험 고객 현황 알려줘': 'D+1 연체 발생 건은 5건이며, 고위험 고객은 2명입니다. 최근 결제 실패 이력이 있는 고객을 먼저 확인해 주세요.',
  '오늘 BNPL 이용 현황 알려줘': '오늘 BNPL 이용은 18건, 승인 금액은 3,200,000원입니다. 전일 대비 이용 건수는 소폭 증가했습니다.',
  '관리자 Action 우선순위 정리해줘': '우선순위는 한도 심사 대기 12건, D+1 연체 5건, 재고 부족 상품 3건 순서입니다.',
};

function AdminCopilot() {
  const messageIdRef = useRef(2);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: '안녕하세요, 관리자님. BNPL 운영 현황과 리스크 분석을 도와드릴게요.',
      time: '10:32',
    },
  ]);

  const openCopilot = () => {
    setIsOpen(true);
  };

  const closeCopilot = () => {
    setIsOpen(false);
    setIsExpanded(false);
  };

  const sendMessage = (text) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    const responseText =
      cannedResponses[trimmedText] || '요청하신 내용을 확인했습니다. 실제 AI 연동 후 운영 데이터 기반으로 답변을 제공할 예정입니다.';

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: messageIdRef.current++,
        role: 'user',
        text: trimmedText,
        time: '방금',
      },
      {
        id: messageIdRef.current++,
        role: 'assistant',
        text: responseText,
        time: '방금',
      },
    ]);
    setInputValue('');
    setIsOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className={`copilot ${isOpen ? 'copilot--open' : ''}`}>
      {isOpen && <div className="copilot__scrim" aria-hidden="true" />}

      {isOpen && (
        <section className={`copilot-panel ${isExpanded ? 'copilot-panel--expanded' : ''}`} aria-label="관리자 도우미 챗봇">
          <header className="copilot-panel__header">
            <div>
              <h2>관리자 도우미 (RiskOps Copilot)</h2>
              <span className="copilot-panel__status">
                <span aria-hidden="true" />
                온라인
              </span>
            </div>
            <div className="copilot-panel__tools" aria-label="챗봇 창 제어">
              <button type="button" className="copilot-icon-button copilot-icon-button--minimize" onClick={() => setIsOpen(false)} aria-label="최소화">
                <span aria-hidden="true" />
              </button>
              <button
                type="button"
                className="copilot-icon-button copilot-icon-button--expand"
                onClick={() => setIsExpanded((currentValue) => !currentValue)}
                aria-label={isExpanded ? '기본 크기로 보기' : '확대'}
              >
                <span aria-hidden="true" />
              </button>
              <button type="button" className="copilot-icon-button copilot-icon-button--close" onClick={closeCopilot} aria-label="닫기">
                <span aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="copilot-panel__body">
            <div className="copilot-messages" aria-live="polite">
              {messages.map((message) => (
                <article key={message.id} className={`copilot-message copilot-message--${message.role}`}>
                  <p>{message.text}</p>
                  <time>{message.time}</time>
                </article>
              ))}
            </div>

            <section className="copilot-section" aria-labelledby="copilot-prompts-title">
              <h3 id="copilot-prompts-title">추천 질문</h3>
              <div className="copilot-prompts">
                {recommendedPrompts.map((prompt) => (
                  <button key={prompt.label} type="button" className="copilot-prompt" onClick={() => sendMessage(prompt.label)}>
                    <span className={`copilot-prompt__mark copilot-prompt__mark--${prompt.tone}`} aria-hidden="true" />
                    {prompt.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="copilot-section copilot-section--recent" aria-labelledby="copilot-recent-title">
              <div className="copilot-section__heading">
                <h3 id="copilot-recent-title">최근 대화</h3>
                <button type="button">더보기 &gt;</button>
              </div>
              <ul className="copilot-recent-list">
                {recentChats.map((chat) => (
                  <li key={chat.title}>
                    <span className="copilot-recent-list__icon" aria-hidden="true" />
                    <span>{chat.title}</span>
                    <time>{chat.time}</time>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <form className="copilot-composer" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="copilot-message">
              관리자 도우미에게 메시지 보내기
            </label>
            <input
              id="copilot-message"
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="메시지를 입력하세요..."
            />
            <button type="submit" aria-label="메시지 전송">
              <span aria-hidden="true" />
            </button>
            <p>AI 생성 답변은 참고용이며, 중요한 의사결정은 담당자의 검토가 필요합니다.</p>
          </form>
        </section>
      )}

      <div className="copilot-launcher">
        <button type="button" className="copilot-launcher__label" onClick={openCopilot}>
          관리자 도우미
        </button>
        <button type="button" className="copilot-launcher__button" onClick={openCopilot} aria-label="관리자 도우미 열기">
          <span className="copilot-launcher__bot" aria-hidden="true">
            <span />
          </span>
          <span className="copilot-launcher__alert" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default AdminCopilot;
