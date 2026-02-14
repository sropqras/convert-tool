import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

describe('App', () => {
  it('renders the ImageConverter component', () => {
    render(<App />);
    // Check if the ImageConverter component's title is present
    const titleElement = screen.getByText(/Convert Tool/i);
    expect(titleElement).toBeInTheDocument();
  });
});