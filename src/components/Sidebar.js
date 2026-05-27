const menuItems = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'limitReview', label: '한도 심사 관리' },
  { id: 'usageStatus', label: '이용 및 연체 현황' },
];

function Sidebar({ activePage, onNavigate }) {
  const isProductOpen = activePage === 'productList' || activePage === 'productCreate' || activePage === 'productEdit';

  return (
    <aside className="sidebar">
      <h1 className="sidebar__brand">BNPL 백오피스</h1>
      <nav className="sidebar__nav" aria-label="관리자 메뉴">
        {menuItems.map((item) => (
          <button
            className={`sidebar__item ${activePage === item.id ? 'sidebar__item--active' : ''}`}
            key={item.id}
            onClick={() => item.id === 'dashboard' && onNavigate('dashboard')}
            type="button"
          >
            {item.label}
          </button>
        ))}
        <button
          className={`sidebar__item ${isProductOpen ? 'sidebar__item--active' : ''}`}
          onClick={() => onNavigate(isProductOpen ? activePage : 'productList')}
          type="button"
        >
          상품 관리
        </button>
        {isProductOpen && (
          <div className="sidebar__submenu" aria-label="상품 관리 하위 메뉴">
            <button
              className={`sidebar__subitem ${activePage === 'productList' ? 'sidebar__subitem--active' : ''}`}
              onClick={() => onNavigate('productList')}
              type="button"
            >
              상품 목록
            </button>
            <button
              className={`sidebar__subitem ${activePage === 'productCreate' ? 'sidebar__subitem--active' : ''}`}
              onClick={() => onNavigate('productCreate')}
              type="button"
            >
              상품 등록
            </button>
          </div>
        )}
        <button className="sidebar__item" type="button">
          주문 및 배송 관리
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
