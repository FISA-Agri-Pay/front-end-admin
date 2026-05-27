export const API_BASE_URL = process.env.REACT_APP_ADMIN_API_BASE_URL || 'http://localhost:8080';

// 백엔드에 카테고리 목록 API가 없을 때 화면에 먼저 보여줄 기본 카테고리 목록
export const PRODUCT_CATEGORIES = [
  { id: 1, name: '영농 서비스' },
  { id: 2, name: '비료/자재' },
  { id: 3, name: '씨앗/모종' },
];

// 관리자 상품에서 사용하는 판매 상태 목록
export const PRODUCT_STATUSES = [
  { value: 'ON_SALE', label: '판매 중' },
  { value: 'HIDDEN', label: '판매 중지' },
];

// 공통 ApiResponse 포맷이 성공인지 판단하는 함수
const isSuccessResponse = (body) => body?.success === true || body?.status === 'SUCCESS';

// 백엔드 에러 응답에서 사용자에게 보여줄 메시지를 추출하는 함수
const getErrorMessage = (body, fallbackMessage, response) => {
  if (body?.error?.message || body?.message) {
    return body?.error?.message || body?.message;
  }
  if (response?.status === 403 || response?.status === 405) {
    return `${fallbackMessage} 백엔드 서버를 재시작해 새 업로드 API가 반영됐는지 확인해 주세요.`;
  }
  return fallbackMessage;
};

// 관리자 API 호출과 공통 에러 처리를 담당하는 함수
export const requestApi = async (path, options = {}, fallbackMessage = '요청 처리에 실패했습니다.') => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok || !isSuccessResponse(body)) {
    throw new Error(getErrorMessage(body, fallbackMessage, response));
  }

  return body?.data;
};

// 상품 목록 응답에 포함된 실제 카테고리 ID로 화면의 카테고리 옵션을 갱신하는 함수
export const mergeCategoriesFromProducts = (currentCategories, products = []) => {
  const categoriesByName = new Map(currentCategories.map((category) => [category.name, category]));

  products.forEach((product) => {
    if (product.categoryId && product.categoryName) {
      categoriesByName.set(product.categoryName, {
        id: product.categoryId,
        name: product.categoryName,
      });
    }
  });

  return Array.from(categoriesByName.values());
};

// 상품 이미지 파일을 백엔드 업로드 API로 전송하고 저장된 이미지 URL을 받는 함수
// 현재 백엔드는 local 프로필에서 서버 로컬 디렉터리에 저장한 뒤 /uploads/products/... URL을 반환한다.
// 추후 AWS S3 연동 시에도 이 프론트 함수는 그대로 두고, 백엔드가 S3 URL을 반환하도록 바꾸면 된다.
export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return requestApi(
    '/products/images',
    {
      method: 'POST',
      body: formData,
    },
    '상품 이미지 업로드에 실패했습니다.'
  );
};

// 백엔드가 /uploads/... 같은 상대 경로를 반환하면 프론트 호스트가 아니라 API 서버 기준 URL로 변환하는 함수
// 이미 http(s)나 blob URL이면 그대로 사용한다.
export const resolveProductImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return '';
  }
  if (/^(https?:|blob:|data:)/.test(imageUrl)) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
};

// 폼 문자열 값을 백엔드 Create/UpdateProductRequest DTO에 맞는 값으로 변환하는 함수
export const toProductPayload = (formData) => ({
  categoryId: Number(formData.categoryId),
  name: formData.name.trim(),
  description: formData.description.trim(),
  price: Number(formData.price),
  stockQuantity: Number(formData.stockQuantity),
  unit: formData.unit.trim(),
  imageUrl: formData.imageUrl.trim() || null,
  status: formData.status,
});
