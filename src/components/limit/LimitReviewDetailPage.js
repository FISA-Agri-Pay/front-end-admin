import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStoredAdminSession } from '../auth/authApi';
import {
  approveCreditReview,
  fetchCreditReviewDetail,
  fetchCreditReviews,
  rejectCreditReview,
} from './limitReviewApi';

const DOCUMENT_TYPE_LABELS = {
  AGRI_MANAGEMENT_REGISTRATION: '농업경영체 등록확인서',
  CROP_DISASTER_INSURANCE: '농작물재해보험 가입증명서',
};

const REVIEW_STATUS_LABELS = {
  PENDING: '심사 대기',
  APPROVED: '승인 완료',
  REJECTED: '반려',
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatNumber = (value, options = {}) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return number.toLocaleString('ko-KR', options);
};

const formatAmountInput = (value) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return formatNumber(value, {
    maximumFractionDigits: 0,
  });
};

const parseAmountInput = (value) => {
  const normalized = String(value || '').replace(/[^\d.]/g, '');
  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : 0;
};

const combineAddress = (...parts) => parts.filter(Boolean).join(' ');

const getDocumentFileName = (document) => {
  if (!document?.fileUrl) {
    return document?.documentType ? `${DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}.pdf` : '제출 서류 없음';
  }

  try {
    const url = new URL(document.fileUrl);
    const fileName = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '');
    return fileName || `${DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}.pdf`;
  } catch (error) {
    const fileName = document.fileUrl.split('?')[0].split('/').filter(Boolean).pop();
    return fileName || `${DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}.pdf`;
  }
};

const getDocumentExtension = (document) => {
  const fileName = getDocumentFileName(document);
  const extension = fileName.includes('.') ? fileName.split('.').pop() : '';

  return extension.toLowerCase();
};

function LimitReviewDetailPage() {
  const [review, setReview] = useState(null);
  const [isMatched, setIsMatched] = useState('yes');
  const [approvedLimit, setApprovedLimit] = useState('');
  const [zoom, setZoom] = useState(100);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const documents = useMemo(() => review?.documents || [], [review]);
  const document = useMemo(() => documents[currentDocumentIndex] || null, [documents, currentDocumentIndex]);
  const documentFileName = useMemo(() => getDocumentFileName(document), [document]);
  const documentExtension = useMemo(() => getDocumentExtension(document), [document]);
  const isImageDocument = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(documentExtension);
  const isPending = review?.status === 'PENDING';

  const applicant = review?.applicant || {};
  const farm = review?.farm || {};
  const ass = review?.ass || {};

  const applicantAddress = combineAddress(applicant.address, applicant.addressDetail);
  const farmAddress = combineAddress(farm.farmAddress, farm.farmAddressDetail);
  const displayAddress = applicantAddress || farmAddress || '-';
  const displayCrop = farm.mainCrop || '-';
  const displayArea =
    farm.fieldAreaPyeong !== undefined && farm.fieldAreaPyeong !== null
      ? `${formatNumber(farm.fieldAreaPyeong, { maximumFractionDigits: 2 })} 평`
      : '-';
  const displaySystemLimit = formatNumber(ass.systemEstimatedLimitAmount, { maximumFractionDigits: 0 });
  const reviewStatusLabel = REVIEW_STATUS_LABELS[review?.status] || review?.status || '';

  const loadPendingReview = useCallback(async (nextMessage = '') => {
    setIsLoading(true);
    setMessage(nextMessage);
    setErrorMessage('');

    try {
      const page = await fetchCreditReviews({ status: 'PENDING', page: 0, size: 1 });
      const nextReview = page?.reviews?.[0];

      if (!nextReview?.publicId) {
        setReview(null);
        setApprovedLimit('');
        setMessage(nextMessage ? `${nextMessage} 심사 대기 중인 한도 신청이 없습니다.` : '심사 대기 중인 한도 신청이 없습니다.');
        return;
      }

      const detail = await fetchCreditReviewDetail(nextReview.publicId);
      setReview(detail);
      setApprovedLimit(formatAmountInput(detail?.decision?.approvedAmount || detail?.ass?.systemEstimatedLimitAmount));
      setIsMatched('yes');
      setZoom(100);
      setCurrentDocumentIndex(0);
      setMessage(nextMessage);
    } catch (error) {
      setReview(null);
      setApprovedLimit('');
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingReview();
  }, [loadPendingReview]);

  const getReviewerPublicId = () => {
    const reviewerPublicId = getStoredAdminSession()?.adminId || '';

    if (!UUID_PATTERN.test(reviewerPublicId)) {
      throw new Error('관리자 공개 ID를 확인할 수 없습니다. 다시 로그인해주세요.');
    }

    return reviewerPublicId;
  };

  const handleApprovedLimitChange = (event) => {
    const nextAmount = parseAmountInput(event.target.value);

    setApprovedLimit(nextAmount ? formatAmountInput(nextAmount) : '');
  };

  const handleApprove = async () => {
    if (!review?.publicId || isProcessing) {
      return;
    }

    const approvedAmount = parseAmountInput(approvedLimit);
    if (approvedAmount <= 0) {
      setErrorMessage('최종 승인 한도 금액을 입력해주세요.');
      return;
    }

    if (!window.confirm(`${formatAmountInput(approvedAmount)}원으로 한도 신청을 승인할까요?`)) {
      return;
    }

    setIsProcessing(true);
    setMessage('');
    setErrorMessage('');

    try {
      await approveCreditReview(review.publicId, {
        reviewedBy: getReviewerPublicId(),
        approvedAmount,
      });
      await loadPendingReview('한도 신청이 승인되었습니다.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!review?.publicId || isProcessing) {
      return;
    }

    const defaultReason = isMatched === 'no' ? '원본 서류와 시스템 추출 데이터가 일치하지 않습니다.' : '';
    const reason = window.prompt('반려 사유를 입력해주세요.', defaultReason);

    if (reason === null) {
      return;
    }

    setIsProcessing(true);
    setMessage('');
    setErrorMessage('');

    try {
      await rejectCreditReview(review.publicId, {
        reviewedBy: getReviewerPublicId(),
        reasonCode: isMatched === 'no' ? 'DOCUMENT_MISMATCH' : 'ADMIN_REJECT',
        reason: reason.trim() || defaultReason || '관리자 반려',
      });
      await loadPendingReview('한도 신청이 반려되었습니다.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZoomOut = () => {
    setZoom((currentZoom) => Math.max(70, currentZoom - 10));
  };

  const handleZoomIn = () => {
    setZoom((currentZoom) => Math.min(140, currentZoom + 10));
  };

  const handlePrevDocument = () => {
    setCurrentDocumentIndex((i) => Math.max(0, i - 1));
  };

  const handleNextDocument = () => {
    setCurrentDocumentIndex((i) => Math.min(documents.length - 1, i + 1));
  };

  return (
    <main className="limit-review-page">
      <div className="limit-review-page__content">
        {(message || errorMessage || isLoading) && (
          <p className={`limit-review-page__message ${errorMessage ? 'limit-review-page__message--error' : ''}`}>
            {errorMessage || message || '한도 심사 정보를 불러오는 중입니다.'}
          </p>
        )}

        <section className="document-panel" aria-labelledby="submitted-document-title">
          <div className="document-panel__header">
            <div className="document-panel__title-group">
              <span className={`document-panel__file ${document ? '' : 'document-panel__file--muted'}`}>
                {documentFileName}
              </span>
              {documents.length > 1 && (
                <div className="document-nav" aria-label="서류 탐색">
                  <button
                    type="button"
                    className="document-nav__btn"
                    aria-label="이전 서류"
                    disabled={currentDocumentIndex === 0}
                    onClick={handlePrevDocument}
                  >
                    ‹
                  </button>
                  <span className="document-nav__indicator">{currentDocumentIndex + 1} / {documents.length}</span>
                  <button
                    type="button"
                    className="document-nav__btn"
                    aria-label="다음 서류"
                    disabled={currentDocumentIndex === documents.length - 1}
                    onClick={handleNextDocument}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
            <div className="document-panel__zoom" aria-label="문서 확대 비율">
              <button type="button" aria-label="축소" onClick={handleZoomOut}>
                -
              </button>
              <span>{zoom}%</span>
              <button type="button" aria-label="확대" onClick={handleZoomIn}>
                +
              </button>
            </div>
          </div>

          <div className={`document-viewer ${document?.fileUrl ? 'document-viewer--file' : ''}`}>
            {document?.fileUrl ? (
              <div className="document-file-shell" style={{ '--document-zoom': zoom / 100 }}>
                {isImageDocument ? (
                  <img className="document-file-preview" src={document.fileUrl} alt={documentFileName} />
                ) : (
                  <iframe className="document-file-preview" src={document.fileUrl} title={documentFileName} />
                )}
              </div>
            ) : (
              <article className="document-page" aria-label="제출 서류 미리보기">
                <h4>제출 서류 없음</h4>
                <div className="document-page__divider" />
                <p>성명: {applicant.name || '-'}</p>
                <p>주소: {displayAddress}</p>
                <div className="document-page__dash" />
                <strong>농지 정보</strong>
                <table>
                  <thead>
                    <tr>
                      <th>재배 작물</th>
                      <th>재배 면적 (평)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{displayCrop}</td>
                      <td>{farm.fieldAreaPyeong ? formatNumber(farm.fieldAreaPyeong) : '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </article>
            )}
          </div>
        </section>

        <section className="limit-review-card" aria-labelledby="limit-review-title">
          <div className="limit-review-card__header">
            <h3 id="limit-review-title">추출 데이터 대조 및 한도 승인</h3>
            {reviewStatusLabel && <span className="limit-review-card__status">{reviewStatusLabel}</span>}
          </div>
          <div className="limit-review-card__body">
            <section className="review-section">
              <h4>신청자 정보</h4>
              <dl className="review-info-list">
                <div>
                  <dt>이름</dt>
                  <dd>{applicant.name || '-'}</dd>
                </div>
                <div>
                  <dt>연락처</dt>
                  <dd>{applicant.phone || '-'}</dd>
                </div>
                <div>
                  <dt>주소</dt>
                  <dd>{displayAddress}</dd>
                </div>
              </dl>
            </section>

            <section className="review-section review-section--with-border">
              <div className="review-section__title-row">
                <h4>시스템 추출 데이터 (ASS)</h4>
                <span>{ass.calculatedAt ? '신용평가 모델 분석 완료' : '신용평가 데이터 대기'}</span>
              </div>
              <dl className="review-info-list review-info-list--strong">
                <div>
                  <dt>주 재배 작물</dt>
                  <dd>{displayCrop}</dd>
                </div>
                <div>
                  <dt>경작지 면적</dt>
                  <dd>{displayArea}</dd>
                </div>
              </dl>
              <div className="expected-limit-box">
                <span>시스템 산출 예상 한도</span>
                <strong>{displaySystemLimit} 원</strong>
              </div>
            </section>

            <section className="review-section review-section--with-border">
              <h4>검토 체크리스트</h4>
              <fieldset className="review-checklist" disabled={!review || isProcessing}>
                <legend>원본 서류와 시스템 추출 데이터 일치 여부</legend>
                <p>1. 원본 서류와 시스템 추출 데이터가 일치합니까?</p>
                <label>
                  <input
                    type="radio"
                    name="documentMatch"
                    value="yes"
                    checked={isMatched === 'yes'}
                    onChange={(event) => setIsMatched(event.target.value)}
                  />
                  예
                </label>
                <label>
                  <input
                    type="radio"
                    name="documentMatch"
                    value="no"
                    checked={isMatched === 'no'}
                    onChange={(event) => setIsMatched(event.target.value)}
                  />
                  아니오
                </label>
              </fieldset>
            </section>

            <section className="review-section review-section--with-border">
              <label className="approved-limit-field" htmlFor="approvedLimit">
                <span>최종 승인 한도 금액</span>
                <div>
                  <input
                    id="approvedLimit"
                    inputMode="numeric"
                    value={approvedLimit}
                    disabled={!review || isProcessing}
                    onChange={handleApprovedLimitChange}
                  />
                  <em>원</em>
                </div>
              </label>
            </section>
          </div>
        </section>
      </div>

      <footer className="limit-review-actions">
        <button
          className="button button--ghost limit-review-actions__back"
          type="button"
          disabled={isLoading || isProcessing}
          onClick={() => loadPendingReview()}
        >
          목록으로
        </button>
        <div className="limit-review-actions__decision">
          <button
            className="button button--danger-outline"
            type="button"
            disabled={!review || !isPending || isProcessing}
            onClick={handleReject}
          >
            반려 처리
          </button>
          <button
            className="button button--primary"
            type="button"
            disabled={!review || !isPending || isProcessing}
            onClick={handleApprove}
          >
            한도 최종 승인
          </button>
        </div>
      </footer>
    </main>
  );
}

export default LimitReviewDetailPage;
