function ProductForm() {
  return (
    <form className="product-form">
      <section className="form-section" aria-labelledby="basic-info-title">
        <h3 id="basic-info-title">상품 기본 정보</h3>
        <div className="form-card">
          {/* TODO: 백엔드 상품 유형/카테고리 코드와 연동 */}
          <div className="form-row">
            <label>
              상품 유형 <span>*</span>
            </label>
            <div className="radio-group">
              <label>
                <input name="productType" type="radio" /> 일반 농자재(배송)
              </label>
              <label>
                <input defaultChecked name="productType" type="radio" /> 영농 서비스(방문 작업)
              </label>
            </div>
          </div>
          <div className="form-row">
            <label htmlFor="category">
              카테고리 <span>*</span>
            </label>
            <select defaultValue="drone" id="category">
              <option value="drone">드론 방제</option>
              <option value="tractor">트랙터 작업</option>
              <option value="fertilizer">비료/자재</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="name">
              상품명 <span>*</span>
            </label>
            <input defaultValue="프리미엄 드론 방제 서비스" id="name" />
          </div>
          <div className="form-row">
            <label htmlFor="summary">한 줄 요약</label>
            <input id="summary" placeholder="예: 병해충 걱정 없는 신속하고 정확한 스마트 방제" />
          </div>
        </div>
      </section>

      <section className="form-section" aria-labelledby="price-title">
        <h3 id="price-title">비용</h3>
        <div className="form-card form-card--compact">
          {/* TODO: 백엔드 가격 정책 및 단위 정보와 연동 */}
          <div className="form-row form-row--inline">
            <label htmlFor="price">
              판매가(평당) <span>*</span>
            </label>
            <input defaultValue="1,500,000" id="price" />
            <span className="form-unit">원</span>
          </div>
        </div>
      </section>

      <section className="form-section" aria-labelledby="media-title">
        <h3 id="media-title">상품 이미지 및 설명</h3>
        <div className="form-card form-card--media">
          {/* TODO: 백엔드 파일 업로드 API와 연동 */}
          <div className="form-row form-row--media">
            <label>
              대표 이미지 <span>*</span>
            </label>
            <div className="image-upload image-upload--large">
              <strong>+</strong>
              <span>여기로 드래그하거나 클릭하여 업로드</span>
            </div>
            <label>상세 이미지</label>
            <div className="image-upload">
              <strong>+</strong>
            </div>
          </div>
          <div className="form-row form-row--editor">
            <label>
              상세 설명 <span>*</span>
            </label>
            <div className="editor-box">
              <div className="editor-box__toolbar">
                <button type="button">B</button>
                <button type="button">I</button>
                <button type="button">U</button>
                <button type="button">▧</button>
              </div>
              <textarea placeholder="작업 일정 협의 방법, 취소/환불 규정 등을 상세하게 작성해 주세요." />
            </div>
          </div>
        </div>
      </section>

      <section className="form-section" aria-labelledby="service-title">
        <h3 id="service-title">서비스 특화 설정 (영농 서비스 전용)</h3>
        <div className="form-card form-card--compact">
          {/* TODO: 백엔드 작업 가능 지역 및 예상 소요 시간 데이터와 연동 */}
          <div className="form-row form-row--service">
            <label>작업 가능 지역</label>
            <select defaultValue="gyeongbuk">
              <option value="gyeongbuk">경상북도</option>
            </select>
            <select defaultValue="andong">
              <option value="andong">안동시</option>
            </select>
            <button className="button button--ghost" type="button">
              + 추가
            </button>
            <label htmlFor="duration">예상 소요 시간</label>
            <input defaultValue="1,000평 기준 2시간 내외" id="duration" />
          </div>
          <p className="form-help">* 설정된 지역 외의 주소지를 가진 사용자는 구매가 제한됩니다.</p>
        </div>
      </section>
    </form>
  );
}

export default ProductForm;
