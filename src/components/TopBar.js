function TopBar({ title }) {
  return (
    <header className="topbar">
      {title && <h2 className="topbar__title">{title}</h2>}
      <div className="topbar__profile">
{/* TODO: 백엔드의 로그인 관리자 정보로 교체 */}
        <span>관리자(admin_01) 님</span>
      </div>
    </header>
  );
}

export default TopBar;
