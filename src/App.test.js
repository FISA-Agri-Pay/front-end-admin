import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test('renders login page without an admin session', () => {
  render(<App />);

  expect(screen.getByRole('textbox', { name: '아이디' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
});

test('renders admin dashboard with a stored admin session', () => {
  localStorage.setItem('adminAccessToken', 'test-admin-token');

  render(<App />);

  expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument();
  expect(screen.getByText('관리자 Action 필요 업무')).toBeInTheDocument();
});
