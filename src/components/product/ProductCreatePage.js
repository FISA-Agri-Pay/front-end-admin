import { useEffect, useMemo, useRef, useState } from 'react';
import ProductForm from './ProductForm';
import {
  PRODUCT_CATEGORIES,
  mergeCategoriesFromProducts,
  requestApi,
  resolveProductImageUrl,
  toProductPayload,
  uploadProductImage,
} from './productApi';

// 신규 등록 화면에서 사용할 빈 폼 상태를 만드는 함수이다.
const createEmptyForm = (categoryOptions) => ({
  categoryId: String(categoryOptions[0]?.id || ''),
  name: '',
  description: '',
  price: '',
  stockQuantity: '0',
  unit: '개',
  imageUrl: '',
  imageFile: null,
  imagePreviewUrl: '',
  imageFileName: '',
  status: 'ON_SALE',
});

// 목록에서 선택한 상품 응답을 수정 폼 상태로 변환하는 함수이다.
const createFormFromProduct = (product, categoryOptions) => ({
  categoryId: String(product.categoryId || categoryOptions[0]?.id || ''),
  name: product.name || '',
  description: product.description || '',
  price: product.price == null ? '' : String(Number(product.price)),
  stockQuantity: product.stockQuantity == null ? '0' : String(product.stockQuantity),
  unit: product.unit || '개',
  imageUrl: product.imageUrl || '',
  imageFile: null,
  imagePreviewUrl: resolveProductImageUrl(product.imageUrl),
  imageFileName: product.imageUrl ? '등록된 대표 이미지' : '',
  status: product.status || 'ON_SALE',
});

function ProductCreatePage({
  categoryOptions = PRODUCT_CATEGORIES,
  editingProduct,
  onCancel,
  onCategoriesLoaded = () => {},
  onSaved,
}) {
  // editingProduct가 있으면 수정 모드, 없으면 신규 등록 모드이다.
  const isEditMode = Boolean(editingProduct);
  const [availableCategories, setAvailableCategories] = useState(categoryOptions);
  // 카테고리 옵션 또는 수정 대상이 바뀌면 폼 초기값을 다시 계산한다.
  const initialForm = useMemo(
    () =>
      editingProduct
        ? createFormFromProduct(editingProduct, availableCategories)
        : createEmptyForm(availableCategories),
    [availableCategories, editingProduct]
  );
  const [formData, setFormData] = useState(initialForm);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const previewObjectUrlRef = useRef('');

  // 상위 컴포넌트에서 새로 전달한 카테고리 옵션을 현재 화면 상태에 반영한다.
  useEffect(() => {
    setAvailableCategories(categoryOptions);
  }, [categoryOptions]);

  // 등록/수정 모드 전환 또는 카테고리 ID 갱신 시 폼을 최신 초기값으로 리셋한다.
  useEffect(() => {
    setFormData(initialForm);
    setMessage('');
    setErrorMessage('');
  }, [initialForm]);

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      setIsLoadingCategories(true);
      try {
        // 카테고리 전용 API가 없으므로 상품 목록 응답에 포함된 실제 카테고리 ID를 사용한다.
        const data = await requestApi('/products?page=0&size=100', undefined, '카테고리 정보를 불러오지 못했습니다.');
        const nextCategories = mergeCategoriesFromProducts(categoryOptions, data.products);
        setAvailableCategories(nextCategories);
        onCategoriesLoaded(nextCategories);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategoryOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 컴포넌트가 사라질 때 브라우저가 만든 임시 미리보기 URL을 해제한다.
  useEffect(
    () => () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    },
    []
  );

  // 모든 입력은 name 속성을 기준으로 같은 핸들러에서 상태를 갱신한다.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  // 실제 파일 선택 UI에서 고른 이미지를 폼 상태와 미리보기에 반영한다.
  const handleImageChange = (file) => {
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrorMessage('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = previewUrl;
    setErrorMessage('');
    setFormData((currentForm) => ({
      ...currentForm,
      imageFile: file,
      imagePreviewUrl: previewUrl,
      imageFileName: file.name,
    }));
  };

  // 브라우저 기본 검증으로 부족한 업무 규칙을 제출 전에 확인한다.
  const validateForm = () => {
    if (!formData.name.trim()) {
      return '상품명을 입력해 주세요.';
    }
    if (isLoadingCategories) {
      return '카테고리 정보를 확인하는 중입니다.';
    }
    if (!formData.unit.trim()) {
      return '단위를 입력해 주세요.';
    }
    if (!formData.categoryId) {
      return '카테고리를 선택해 주세요.';
    }
    if (Number(formData.price) <= 0) {
      return '판매가는 1원 이상이어야 합니다.';
    }
    if (Number(formData.stockQuantity) < 0) {
      return '재고는 0개 이상이어야 합니다.';
    }
    return '';
  };

  // 선택한 이미지 파일이 있으면 먼저 업로드하고, 반환된 URL을 상품 저장 payload에 넣는다.
  // 테스트 방법은 관리자 화면에서 이미지를 선택한 뒤 저장하고, 응답 imageUrl이 /uploads/products/...인지 확인하는 것이다.
  // AWS S3 연동 시에는 uploadProductImage 호출 흐름은 유지하고 백엔드가 S3 URL을 반환하게 바꾸면 된다.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setIsUploadingImage(Boolean(formData.imageFile));
    setMessage('');
    setErrorMessage('');

    try {
      let productFormData = formData;

      if (formData.imageFile) {
        const uploadedImage = await uploadProductImage(formData.imageFile);
        setIsUploadingImage(false);
        productFormData = {
          ...formData,
          imageUrl: uploadedImage.imageUrl,
        };
      }

      const payload = toProductPayload(productFormData);
      const savedProduct = await requestApi(
        isEditMode ? `/products/${editingProduct.publicId}` : '/products',
        {
          method: isEditMode ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        isEditMode ? '상품 수정에 실패했습니다.' : '상품 등록에 실패했습니다.'
      );

      setMessage(isEditMode ? '상품을 수정했습니다.' : '상품을 등록했습니다.');
      onSaved(savedProduct);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <main className="product-page product-page--form">
      <div className="product-page__header">
        <h2>{isEditMode ? '상품 수정' : '신규 상품 등록'}</h2>
        <div className="product-page__actions">
          <button className="button button--ghost" onClick={onCancel} type="button">
            취소
          </button>
          <button
            className="button button--primary"
            disabled={isSubmitting || isLoadingCategories || isUploadingImage}
            form="product-form"
            type="submit"
          >
            {isUploadingImage ? '이미지 업로드 중' : isSubmitting ? '저장 중' : isEditMode ? '수정 완료' : '등록 완료'}
          </button>
        </div>
      </div>
      {message && <p className="product-page__message">{message}</p>}
      {isLoadingCategories && <p className="product-page__message">카테고리 정보를 확인하는 중입니다.</p>}
      {isUploadingImage && <p className="product-page__message">상품 이미지를 업로드하는 중입니다.</p>}
      {errorMessage && <p className="product-page__message product-page__message--error">{errorMessage}</p>}
      <ProductForm
        categoryOptions={availableCategories}
        formData={formData}
        isSubmitting={isSubmitting || isLoadingCategories || isUploadingImage}
        onChange={handleChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
      />
      <button className="button button--ghost product-page__back" onClick={onCancel} type="button">
        목록으로 돌아가기
      </button>
    </main>
  );
}

export default ProductCreatePage;
