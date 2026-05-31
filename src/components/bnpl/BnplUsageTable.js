import { BNPL_STATUS_LABELS } from './bnplApi';

const statusTones = {
  NORMAL: 'green',
  OVERDUE: 'red',
  SUSPENDED: 'gray',
  REPAID: 'gray',
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('ko-KR')} 원`;
const formatDate = (value) => value || '-';

function BnplUsageTable({
  actionUserId,
  pageInfo,
  users,
  onChangePage,
  onSendAlert,
}) {
  const totalPages = pageInfo.totalPages || 1;
  const currentPage = pageInfo.currentPage || 1;
  const pageStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pageEnd = Math.min(totalPages, pageStart + 4);
  const pageNumbers = Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index);

  const getActionLabel = (status) => {
    if (status === 'OVERDUE') {
      return '독촉톡 발송';
    }
    if (status === 'NORMAL') {
      return '알림톡 발송';
    }
    return '발송 불가';
  };

  return (
    <section className="bnpl-table-card">
      <div className="bnpl-table" role="table" aria-label="사용자별 BNPL 이용 현황">
        <div className="bnpl-table__row bnpl-table__row--head" role="row">
          <span role="columnheader">사용자명</span>
          <span role="columnheader">연락처</span>
          <span role="columnheader">총 한도</span>
          <span role="columnheader">사용 금액</span>
          <span role="columnheader">상환 만기일</span>
          <span role="columnheader">상태</span>
          <span role="columnheader">관리</span>
        </div>
        {users.length === 0 && (
          <div className="bnpl-table__empty" role="row">
            조회된 BNPL 이용 현황이 없습니다.
          </div>
        )}
        {users.map((user) => {
          const isOverdue = user.status === 'OVERDUE' || user.isOverdue;
          const isActionDisabled = user.status !== 'NORMAL' && user.status !== 'OVERDUE';

          return (
            <div className={`bnpl-table__row ${isOverdue ? 'bnpl-table__row--overdue' : ''}`} role="row" key={user.userId}>
              <strong role="cell">{user.userName}</strong>
              <span role="cell">{user.phone}</span>
              <span role="cell">{formatCurrency(user.creditLimit)}</span>
              <span className={isOverdue ? 'bnpl-table__emphasis' : ''} role="cell">
                {formatCurrency(user.usedAmount)}
              </span>
              <span className={isOverdue ? 'bnpl-table__emphasis' : ''} role="cell">
                {formatDate(user.nextRepaymentDate)}
              </span>
              <span role="cell">
                <span className={`status-chip status-chip--${statusTones[user.status] || 'gray'}`}>
                  {BNPL_STATUS_LABELS[user.status] || user.status}
                </span>
              </span>
              <span className="bnpl-table__actions" role="cell">
                <button
                  className={isOverdue ? 'bnpl-table__action bnpl-table__action--danger' : 'bnpl-table__action'}
                  disabled={isActionDisabled || actionUserId === user.userId}
                  onClick={() => onSendAlert(user)}
                  type="button"
                >
                  {actionUserId === user.userId ? '발송 중' : getActionLabel(user.status)}
                </button>
              </span>
            </div>
          );
        })}
      </div>
      <div className="bnpl-table-card__footer">
        <span>총 {Number(pageInfo.totalCount || 0).toLocaleString('ko-KR')}건</span>
        <nav className="pagination" aria-label="BNPL 이용 현황 페이지">
          <button type="button" aria-label="이전 페이지" disabled={currentPage <= 1} onClick={() => onChangePage(currentPage - 1)}>
            ‹
          </button>
          {pageNumbers.map((page) => (
            <button
              className={page === currentPage ? 'pagination__item--active' : ''}
              aria-current={page === currentPage ? 'page' : undefined}
              key={page}
              type="button"
              onClick={() => onChangePage(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            aria-label="다음 페이지"
            disabled={currentPage >= totalPages}
            onClick={() => onChangePage(currentPage + 1)}
          >
            ›
          </button>
        </nav>
      </div>
    </section>
  );
}

export default BnplUsageTable;
