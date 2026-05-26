const menuItems = ['대시보드', '한도 심사 관리', '이용 및 연체 현황', '상품 관리'];

function Sidebar() {
  return (
    <aside className="sidebar">
      <h1 className="sidebar__brand">BNPL 백오피스</h1>
      <nav className="sidebar__nav" aria-label="관리자 메뉴">
        {menuItems.map((item, index) => (
          <button
            className={`sidebar__item ${index === 0 ? 'sidebar__item--active' : ''}`}
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
