function TopBar() {
  return (
    <header className="topbar">
      <h2 className="topbar__title">대시보드</h2>
      <div className="topbar__profile">
        <span className="topbar__avatar" aria-hidden="true" />
        {/* TODO: 백엔드의 로그인 관리자 정보로 교체 */}
        <span>관리자(admin_01) 님</span>
      </div>
    </header>
  );
}

export default TopBar;
