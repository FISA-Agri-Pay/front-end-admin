import ProductForm from './ProductForm';

function ProductCreatePage({ onNavigate }) {
  return (
    <main className="product-page product-page--form">
      <div className="product-page__header">
        <h2>신규 상품 등록</h2>
        <div className="product-page__actions">
          <button className="button button--ghost" type="button">
            임시 저장
          </button>
          <button className="button button--primary" type="button">
            등록 완료
          </button>
        </div>
      </div>
      <ProductForm />
      <button className="button button--ghost product-page__back" onClick={() => onNavigate('productList')} type="button">
        취소하고 목록으로
      </button>
    </main>
  );
}

export default ProductCreatePage;
