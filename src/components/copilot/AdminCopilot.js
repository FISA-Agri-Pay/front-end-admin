import { useCallback, useRef, useState } from 'react';
import { getStoredAdminSession } from '../auth/authApi';
import { askAdminCopilot, fetchAdminCopilotSessions } from './copilotApi';

const recommendedPrompts = [
  { tone: 'green', label: '심사 대기 건 요약해줘' },
  { tone: 'red', label: '연체 위험 고객 현황 알려줘' },
  { tone: 'blue', label: '오늘 BNPL 이용 현황 알려줘' },
  { tone: 'purple', label: '관리자 Action 우선순위 정리해줘' },
];

const messageSectionTitles = new Set(['요약', '주요 지표', '판단', '우선 조치', '데이터 한계']);

const normalizeMessageText = (value) => String(value || '').replace(/\\n/g, '\n').trim();

const getMessageLineClassName = (line) => {
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    return 'copilot-message__line copilot-message__line--spacer';
  }

  if (messageSectionTitles.has(trimmedLine)) {
    return 'copilot-message__line copilot-message__line--heading';
  }

  if (/^[-*]\s+/.test(trimmedLine)) {
    return 'copilot-message__line copilot-message__line--bullet';
  }

  return 'copilot-message__line';
};

const renderMessageText = (text) => {
  const normalizedText = normalizeMessageText(text);

  if (!normalizedText) {
    return <span className="copilot-message__line">표시할 메시지가 없습니다.</span>;
  }

  return normalizedText.split('\n').map((line, index) => (
    <span key={`${line}-${index}`} className={getMessageLineClassName(line)}>
      {/^[-*]\s+/.test(line.trim()) ? line.replace(/^(\s*)[-*]\s+/, '$1') : line}
    </span>
  ));
};

const formatMessageTime = (value) => {
  if (!value) {
    return '방금';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '방금';
  }

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getAdminUserId = () => {
  const session = getStoredAdminSession();

  return session?.adminId || session?.name || 'admin-1';
};

function AdminCopilot() {
  const messageIdRef = useRef(2);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasLoadedSessions, setHasLoadedSessions] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [recentChats, setRecentChats] = useState([]);
  const [recentErrorMessage, setRecentErrorMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: '안녕하세요. 관리자 운영 현황과 리스크 분석을 도와드릴게요.',
      time: '방금',
    },
  ]);

  const loadRecentChats = useCallback(async () => {
    setRecentErrorMessage('');

    try {
      const data = await fetchAdminCopilotSessions({
        userId: getAdminUserId(),
        status: 'OPEN',
        limit: 5,
      });

      setRecentChats(data?.items || []);
      setHasLoadedSessions(true);
    } catch (error) {
      setRecentErrorMessage(error.message);
      setHasLoadedSessions(true);
    }
  }, []);

  const openCopilot = () => {
    setIsOpen(true);

    if (!hasLoadedSessions) {
      loadRecentChats();
    }
  };

  const closeCopilot = () => {
    setIsOpen(false);
    setIsExpanded(false);
  };

  const appendMessage = (message) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: messageIdRef.current++,
        time: '방금',
        ...message,
      },
    ]);
  };

  const sendMessage = async (text) => {
    const trimmedText = text.trim();

    if (!trimmedText || isSending) {
      return;
    }

    appendMessage({
      role: 'user',
      text: trimmedText,
    });
    setInputValue('');
    setIsOpen(true);
    setIsSending(true);

    try {
      const result = await askAdminCopilot({
        message: trimmedText,
        sessionId,
        userId: getAdminUserId(),
      });
      const nextSessionId = result?.session?.session_id || sessionId;
      const answer = result?.assistant_message?.content || '답변을 생성했지만 표시할 내용이 없습니다.';

      if (nextSessionId) {
        setSessionId(nextSessionId);
      }

      appendMessage({
        role: 'assistant',
        text: answer,
        time: formatMessageTime(result?.assistant_message?.created_at),
      });

      loadRecentChats();
    } catch (error) {
      appendMessage({
        role: 'assistant',
        text: `챗봇 응답을 가져오지 못했습니다. ${error.message}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className={`copilot ${isOpen ? 'copilot--open' : ''}`}>
      {isOpen && <div className="copilot__scrim" aria-hidden="true" />}

      {isOpen && (
        <section
          className={`copilot-panel ${isExpanded ? 'copilot-panel--expanded' : ''}`}
          aria-label="관리자 도우미 챗봇"
        >
          <header className="copilot-panel__header">
            <div>
              <h2>관리자 도우미 (RiskOps Copilot)</h2>
              <span className="copilot-panel__status">
                <span aria-hidden="true" />
                {isSending ? '응답 생성 중' : '온라인'}
              </span>
            </div>
            <div className="copilot-panel__tools" aria-label="챗봇 창 제어">
              <button
                type="button"
                className="copilot-icon-button copilot-icon-button--minimize"
                onClick={() => setIsOpen(false)}
                aria-label="최소화"
              >
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
              <button
                type="button"
                className="copilot-icon-button copilot-icon-button--close"
                onClick={closeCopilot}
                aria-label="닫기"
              >
                <span aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="copilot-panel__body">
            <div className="copilot-messages" aria-live="polite" aria-busy={isSending}>
              {messages.map((message) => (
                <article key={message.id} className={`copilot-message copilot-message--${message.role}`}>
                  <div className="copilot-message__bubble">{renderMessageText(message.text)}</div>
                  <time>{message.time}</time>
                </article>
              ))}
              {isSending && (
                <article className="copilot-message copilot-message--assistant">
                  <div className="copilot-message__bubble">{renderMessageText('답변을 생성하는 중입니다.')}</div>
                  <time>방금</time>
                </article>
              )}
            </div>

            <section className="copilot-section" aria-labelledby="copilot-prompts-title">
              <h3 id="copilot-prompts-title">추천 질문</h3>
              <div className="copilot-prompts">
                {recommendedPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    className="copilot-prompt"
                    disabled={isSending}
                    onClick={() => sendMessage(prompt.label)}
                  >
                    <span className={`copilot-prompt__mark copilot-prompt__mark--${prompt.tone}`} aria-hidden="true" />
                    {prompt.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="copilot-section copilot-section--recent" aria-labelledby="copilot-recent-title">
              <div className="copilot-section__heading">
                <h3 id="copilot-recent-title">최근 대화</h3>
                <button type="button" onClick={loadRecentChats}>
                  새로고침
                </button>
              </div>
              <ul className="copilot-recent-list">
                {recentErrorMessage && (
                  <li>
                    <span className="copilot-recent-list__icon" aria-hidden="true" />
                    <span>{recentErrorMessage}</span>
                    <time>오류</time>
                  </li>
                )}
                {!recentErrorMessage &&
                  recentChats.map((chat) => (
                    <li key={chat.session_id}>
                      <span className="copilot-recent-list__icon" aria-hidden="true" />
                      <span>{chat.title || '관리자 챗봇 대화'}</span>
                      <time>{formatMessageTime(chat.updated_at)}</time>
                    </li>
                  ))}
                {!recentErrorMessage && recentChats.length === 0 && (
                  <li>
                    <span className="copilot-recent-list__icon" aria-hidden="true" />
                    <span>최근 대화가 없습니다.</span>
                    <time>-</time>
                  </li>
                )}
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
              disabled={isSending}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="메시지를 입력하세요..."
            />
            <button type="submit" disabled={isSending || !inputValue.trim()} aria-label="메시지 전송">
              <span aria-hidden="true" />
            </button>
            <p>AI 생성 응답은 참고용이며, 중요한 의사결정은 담당자의 검토가 필요합니다.</p>
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
