import { BNPL_STATUSES } from './bnplApi';

function BnplFilters({ filters, isExporting, onChange, onExport, onSearch }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className="bnpl-filter" aria-label="BNPL 이용 현황 검색 필터" onSubmit={handleSubmit}>
      <div className="bnpl-filter__dates">
        <label className="visually-hidden" htmlFor="bnpl-start-date">
          조회 시작일
        </label>
        <input
          id="bnpl-start-date"
          type="date"
          value={filters.startDate}
          onChange={(event) => onChange('startDate', event.target.value)}
        />
        <span aria-hidden="true">~</span>
        <label className="visually-hidden" htmlFor="bnpl-end-date">
          조회 종료일
        </label>
        <input
          id="bnpl-end-date"
          type="date"
          value={filters.endDate}
          onChange={(event) => onChange('endDate', event.target.value)}
        />
      </div>
      <select
        aria-label="BNPL 이용 상태"
        value={filters.status}
        onChange={(event) => onChange('status', event.target.value)}
      >
        {BNPL_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <label className="visually-hidden" htmlFor="bnpl-search">
        이름 또는 연락처 검색
      </label>
      <input
        id="bnpl-search"
        placeholder="이름 또는 연락처 검색"
        type="search"
        value={filters.search}
        onChange={(event) => onChange('search', event.target.value)}
      />
      <button className="button button--dark" type="submit">
        조회
      </button>
      <button className="button button--ghost bnpl-filter__export" disabled={isExporting} onClick={onExport} type="button">
        {isExporting ? '다운로드 중' : '엑셀 다운로드'}
      </button>
    </form>
  );
}

export default BnplFilters;
