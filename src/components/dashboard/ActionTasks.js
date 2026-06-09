const formatCount = (value) => Number(value ?? 0).toLocaleString('ko-KR');

const createTasks = (actionRequired) => [
  {
    id: 'limit-review',
    status: '심사 대기',
    tone: 'green',
    targetPage: 'limitReview',
    description: `미처리 한도 심사 건이 ${formatCount(actionRequired?.pendingCreditReviewCount)}건 있습니다.`,
  },
  {
    id: 'low-stock',
    status: '재고 확인',
    tone: 'orange',
    targetPage: 'productList',
    description: `품절 또는 재고 부족 상품이 ${formatCount(actionRequired?.outOfStockProductCount)}건 있습니다.`,
  },
  {
    id: 'overdue',
    status: '연체 발생',
    tone: 'red',
    targetPage: 'usageStatus',
    description: `미해소 연체 건이 ${formatCount(actionRequired?.overdueIssueCount)}건 있습니다.`,
  },
];

function ActionTasks({ actionRequired, isLoading, onNavigate }) {
  const tasks = createTasks(actionRequired);

  const handleNavigate = (targetPage) => {
    if (!targetPage || typeof onNavigate !== 'function') {
      return;
    }

    onNavigate(targetPage);
  };

  return (
    <section className="panel task-panel">
      <h3 className="panel__title">관리자 Action 필요 업무</h3>
      <ul className="task-list">
        {isLoading && (
          <li className="task-list__item task-list__item--empty">
            <p>처리 필요 업무를 불러오는 중입니다.</p>
          </li>
        )}
        {!isLoading &&
          tasks.map((task) => (
            <li className="task-list__item" key={task.id}>
              <span className={`task-list__badge task-list__badge--${task.tone}`}>{task.status}</span>
              <p>{task.description}</p>
              <button type="button" onClick={() => handleNavigate(task.targetPage)}>
                이동 &gt;
              </button>
            </li>
          ))}
      </ul>
    </section>
  );
}

export default ActionTasks;
