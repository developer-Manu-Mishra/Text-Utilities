import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the text analyzer heading', () => {
  render(<App />);
  expect(screen.getByText(/enter text to analyze below/i)).toBeInTheDocument();
  expect(screen.getByText(/your text summary/i)).toBeInTheDocument();
});
