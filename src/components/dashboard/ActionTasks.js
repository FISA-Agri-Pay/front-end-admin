const tasks = [
  // TODO: 백엔드의 관리자 처리 필요 업무 목록으로 교체
  { id: 'limit-review', status: '심사 대기', tone: 'green', description: '미처리 한도 심사 건이 12건 있습니다.' },
  { id: 'low-stock', status: '재고 부족', tone: 'orange', description: '재고 부족 상품이 3건 있습니다.' },
  { id: 'overdue', status: '상환 지연', tone: 'red', description: 'D+1 연체 발생 건이 5건 있습니다.' },
];

function ActionTasks() {
  return (
    <section className="panel task-panel">
      <h3 className="panel__title">관리자 Action 필요 업무</h3>
      <ul className="task-list">
        {tasks.map((task) => (
          <li className="task-list__item" key={task.id}>
            <span className={`task-list__badge task-list__badge--${task.tone}`}>{task.status}</span>
            <p>{task.description}</p>
            <button type="button" disabled>
              이동 &gt;
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActionTasks;
