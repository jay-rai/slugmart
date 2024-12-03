import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const Logintest = screen.getByText("Login");
  expect(Logintest).toBeInTheDocument();
});
