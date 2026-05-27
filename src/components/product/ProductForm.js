import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from './productApi';

// 상품 등록과 수정에서 공통으로 사용하는 제어 컴포넌트 폼이다.
function ProductForm({
  categoryOptions = PRODUCT_CATEGORIES,
  formData,
  isSubmitting,
  onChange,
  onImageChange = () => {},
  onSubmit,
}) {
  // 파일 선택, 드래그 앤 드롭 모두 같은 이미지 변경 핸들러로 전달한다.
  const handleFileChange = (event) => {
    onImageChange(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    onImageChange(event.dataTransfer.files?.[0]);
  };

  return (
    <form className="product-form" id="product-form" onSubmit={onSubmit}>
      <section className="form-section" aria-labelledby="basic-info-title">
        <h3 id="basic-info-title">상품 기본 정보</h3>
        <div className="form-card">
          <div className="form-row">
            <label htmlFor="categoryId">
              카테고리 <span>*</span>
            </label>
            {/* categoryId는 백엔드 등록/수정 DTO에서 필수로 요구하는 값이다. */}
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={onChange}
              required
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="name">
              상품명 <span>*</span>
            </label>
            <input
              id="name"
              maxLength="100"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="상품명을 입력해 주세요"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="status">
              판매 상태 <span>*</span>
            </label>
            {/* 현재 상품 상태는 판매 중과 판매 중지만 사용한다. */}
            <select id="status" name="status" value={formData.status} onChange={onChange} required>
              {PRODUCT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="form-section" aria-labelledby="price-title">
        <h3 id="price-title">판매 정보</h3>
        <div className="form-card form-card--compact">
          {/* 가격, 재고, 단위는 백엔드 CreateProductRequest의 필수 필드이다. */}
          <div className="form-row form-row--inline">
            <label htmlFor="price">
              판매가 <span>*</span>
            </label>
            <input
              id="price"
              min="1"
              name="price"
              step="1"
              type="number"
              value={formData.price}
              onChange={onChange}
              required
            />
            <span className="form-unit">원</span>
          </div>
          <div className="form-row form-row--inline">
            <label htmlFor="stockQuantity">
              재고 <span>*</span>
            </label>
            <input
              id="stockQuantity"
              min="0"
              name="stockQuantity"
              step="1"
              type="number"
              value={formData.stockQuantity}
              onChange={onChange}
              required
            />
            <span className="form-unit">개</span>
          </div>
          <div className="form-row form-row--inline">
            <label htmlFor="unit">
              단위 <span>*</span>
            </label>
            <input
              id="unit"
              maxLength="20"
              name="unit"
              value={formData.unit}
              onChange={onChange}
              placeholder="회, 일, 포, 판"
              required
            />
          </div>
        </div>
      </section>

      <section className="form-section" aria-labelledby="media-title">
        <h3 id="media-title">상품 이미지 및 설명</h3>
        <div className="form-card form-card--media">
          {/* 선택 파일은 저장 버튼 클릭 시 업로드 API로 전송되고, DB에는 업로드 API가 반환한 URL만 저장되는 구조이다. */}
          <div className="form-row form-row--media">
            <label htmlFor="imageFile">대표 이미지</label>
            <label
              className="image-upload image-upload--large"
              htmlFor="imageFile"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {formData.imagePreviewUrl ? (
                <img className="image-upload__preview" src={formData.imagePreviewUrl} alt="" />
              ) : (
                <>
                  <strong>+</strong>
                  <span>여기로 드래그하거나 클릭하여 업로드</span>
                </>
              )}
            </label>
            <input
              accept="image/*"
              className="image-upload__input"
              disabled={isSubmitting}
              id="imageFile"
              name="imageFile"
              onChange={handleFileChange}
              type="file"
            />
            <span className="image-upload__filename">{formData.imageFileName || '선택된 파일 없음'}</span>
          </div>
          <div className="form-row form-row--editor">
            <label htmlFor="description">상세 설명</label>
            <div className="editor-box">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="상품 설명, 작업 방식, 취소/환불 규정 등을 작성해 주세요."
              />
            </div>
          </div>
        </div>
      </section>

      {/* 상단 저장 버튼이 form 속성으로 이 숨김 submit 버튼과 같은 폼 제출을 실행한다. */}
      <button disabled={isSubmitting} hidden type="submit">
        저장
      </button>
    </form>
  );
}

export default ProductForm;
