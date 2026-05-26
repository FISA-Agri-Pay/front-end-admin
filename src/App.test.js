import { render, screen } from '@testing-library/react';
import App from './App';

test('renders admin dashboard', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument();
  expect(screen.getByText('관리자 Action 필요 업무')).toBeInTheDocument();
});
