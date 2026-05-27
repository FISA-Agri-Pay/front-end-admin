import { useState } from 'react';
import ProductCreatePage from './ProductCreatePage';
import ProductListPage from './ProductListPage';
import { PRODUCT_CATEGORIES } from './productApi';

// 상품 목록, 등록, 수정 화면의 전환 상태를 관리하는 컨테이너 컴포넌트
function ProductManagement({ activePage, onNavigate }) {
  // 수정 화면은 별도 상세 조회 API가 없으므로 목록에서 선택한 상품 응답을 보관한다.
  const [editingProduct, setEditingProduct] = useState(null);
  // 상품 목록 응답에서 확인한 실제 카테고리 ID를 등록/수정 화면에 공유한다.
  const [categoryOptions, setCategoryOptions] = useState(PRODUCT_CATEGORIES);

  // 목록으로 돌아갈 때는 수정 대상을 초기화한다.
  const moveToList = () => {
    setEditingProduct(null);
    onNavigate('productList');
  };

  // 신규 등록은 이전 수정 대상이 남지 않도록 초기화한 뒤 이동한다.
  const moveToCreate = () => {
    setEditingProduct(null);
    onNavigate('productCreate');
  };

  // 수정은 선택한 상품 데이터를 보관하고 수정 화면으로 이동한다.
  const moveToEdit = (product) => {
    setEditingProduct(product);
    onNavigate('productEdit');
  };

  // 신규 등록 화면
  if (activePage === 'productCreate') {
    return (
      <ProductCreatePage
        categoryOptions={categoryOptions}
        editingProduct={null}
        onCancel={moveToList}
        onCategoriesLoaded={setCategoryOptions}
        onSaved={moveToList}
      />
    );
  }

  // 수정 화면 수정 대상이 사라진 경우에는 목록 화면으로 대체한다.
  if (activePage === 'productEdit') {
    if (!editingProduct) {
      return (
        <ProductListPage
          onCategoriesLoaded={setCategoryOptions}
          onCreate={moveToCreate}
          onEdit={moveToEdit}
        />
      );
    }

    return (
      <ProductCreatePage
        categoryOptions={categoryOptions}
        editingProduct={editingProduct}
        onCancel={moveToList}
        onCategoriesLoaded={setCategoryOptions}
        onSaved={moveToList}
      />
    );
  }

  return <ProductListPage onCategoriesLoaded={setCategoryOptions} onCreate={moveToCreate} onEdit={moveToEdit} />;
}

export default ProductManagement;
