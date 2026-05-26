import ProductCreatePage from './ProductCreatePage';
import ProductListPage from './ProductListPage';

function ProductManagement({ activePage, onNavigate }) {
  if (activePage === 'productCreate') {
    return <ProductCreatePage onNavigate={onNavigate} />;
  }

  return <ProductListPage onNavigate={onNavigate} />;
}

export default ProductManagement;
