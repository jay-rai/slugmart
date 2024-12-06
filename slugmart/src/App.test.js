import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const Loginscreentest = screen.getByText("must have @ucsc.edu email");
  expect(Loginscreentest).toBeInTheDocument();
});
