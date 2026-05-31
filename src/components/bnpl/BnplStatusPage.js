import { useEffect, useState } from 'react';
import BnplFilters from './BnplFilters';
import BnplSummaryCards from './BnplSummaryCards';
import BnplUsageTable from './BnplUsageTable';
import {
  downloadBnplUsersExcel,
  fetchBnplSummary,
  fetchBnplUsers,
  sendOverdueAlert,
  sendRepaymentAlert,
} from './bnplApi';

const PAGE_SIZE = 5;

const formatDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createDefaultFilters = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    startDate: formatDateInputValue(firstDay),
    endDate: formatDateInputValue(today),
    status: 'ALL',
    search: '',
  };
};

function BnplStatusPage() {
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [actionUserId, setActionUserId] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const data = await fetchBnplSummary();
        setSummary(data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    loadSummary();
  }, []);

  const loadUsers = async (page = 1, nextFilters = appliedFilters) => {
    setIsLoadingUsers(true);
    setErrorMessage('');

    try {
      const data = await fetchBnplUsers({
        ...nextFilters,
        page,
        size: PAGE_SIZE,
      });

      setUsers(data.users || []);
      setPageInfo({
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        totalCount: data.pagination?.totalCount || 0,
      });
    } catch (error) {
      setUsers([]);
      setErrorMessage(error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers(1, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const handleFilterChange = (name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setMessage('');
    setAppliedFilters(filters);
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > pageInfo.totalPages || page === pageInfo.currentPage) {
      return;
    }
    loadUsers(page);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage('');

    try {
      const { blob, fileName } = await downloadBnplUsersExcel(appliedFilters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendAlert = async (user) => {
    const isOverdue = user.status === 'OVERDUE';
    const actionLabel = isOverdue ? '독촉톡' : '알림톡';

    if (!window.confirm(`${user.userName} 님에게 ${actionLabel}을 발송할까요?`)) {
      return;
    }

    setActionUserId(user.userId);
    setMessage('');
    setErrorMessage('');

    try {
      if (isOverdue) {
        await sendOverdueAlert(user.userId);
      } else {
        await sendRepaymentAlert(user.userId);
      }

      setMessage(`${user.userName} 님에게 ${actionLabel}을 발송했습니다.`);
      await loadUsers(pageInfo.currentPage);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionUserId('');
    }
  };

  return (
    <main className="bnpl-page">
      <BnplSummaryCards summary={summary} />
      {isLoadingSummary && <p className="bnpl-page__message">이용 현황을 확인하는 중입니다.</p>}
      <BnplFilters
        filters={filters}
        isExporting={isExporting}
        onChange={handleFilterChange}
        onExport={handleExport}
        onSearch={handleSearch}
      />
      {message && <p className="bnpl-page__message">{message}</p>}
      {errorMessage && <p className="bnpl-page__message bnpl-page__message--error">{errorMessage}</p>}
      {isLoadingUsers && <p className="bnpl-page__message">사용자별 이용 현황을 불러오는 중입니다.</p>}
      <BnplUsageTable
        actionUserId={actionUserId}
        pageInfo={pageInfo}
        users={users}
        onChangePage={handleChangePage}
        onSendAlert={handleSendAlert}
      />
    </main>
  );
}

export default BnplStatusPage;
