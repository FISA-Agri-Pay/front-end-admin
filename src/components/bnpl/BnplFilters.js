import { useRef, useState } from 'react';
import { BNPL_STATUSES } from './bnplApi';

const toDisplayDate = (value) => value.replaceAll('-', '.');

const toApiDate = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);

  return [year, month, day].filter(Boolean).join('-');
};

function BnplFilters({ filters, isExporting, onChange, onExport, onSearch }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const startDateRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  const handleCalendarClick = () => {
    setIsCalendarOpen((currentValue) => !currentValue);
    setTimeout(() => {
      if (startDateRef.current?.showPicker) {
        startDateRef.current.showPicker();
      } else {
        startDateRef.current?.focus();
      }
    }, 0);
  };

  return (
    <form className="bnpl-filter" aria-label="BNPL 이용 현황 검색 필터" onSubmit={handleSubmit}>
      <div className="bnpl-filter__dates">
        <label className="visually-hidden" htmlFor="bnpl-start-date">
          조회 시작일
        </label>
        <input
          id="bnpl-start-date"
          inputMode="numeric"
          placeholder="YYYY.MM.DD"
          type="text"
          value={toDisplayDate(filters.startDate)}
          onChange={(event) => onChange('startDate', toApiDate(event.target.value))}
        />
        <span aria-hidden="true">~</span>
        <label className="visually-hidden" htmlFor="bnpl-end-date">
          조회 종료일
        </label>
        <input
          id="bnpl-end-date"
          inputMode="numeric"
          placeholder="YYYY.MM.DD"
          type="text"
          value={toDisplayDate(filters.endDate)}
          onChange={(event) => onChange('endDate', toApiDate(event.target.value))}
        />
        <button
          className="bnpl-filter__calendar"
          type="button"
          aria-label="조회 기간 달력 열기"
          aria-expanded={isCalendarOpen}
          onClick={handleCalendarClick}
        >
          <span aria-hidden="true" />
        </button>
        {isCalendarOpen && (
          <div className="bnpl-filter__calendar-popover">
            <label htmlFor="bnpl-start-picker">시작일</label>
            <input
              id="bnpl-start-picker"
              ref={startDateRef}
              type="date"
              value={filters.startDate}
              onChange={(event) => onChange('startDate', event.target.value)}
            />
            <label htmlFor="bnpl-end-picker">종료일</label>
            <input
              id="bnpl-end-picker"
              type="date"
              value={filters.endDate}
              onChange={(event) => onChange('endDate', event.target.value)}
            />
            <button className="button button--dark" type="button" onClick={() => setIsCalendarOpen(false)}>
              적용
            </button>
          </div>
        )}
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
