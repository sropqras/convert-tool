import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageConverter from './ImageConverter';
import { convertImage } from './imageUtils';

// Mock the convertImage utility function
jest.mock('./imageUtils', () => ({
  convertImage: jest.fn(),
}));

describe('ImageConverter', () => {
  beforeEach(() => {
    // Reset the mock before each test
    convertImage.mockReset();
    // Mock URL.createObjectURL as it's not available in jsdom
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-image-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(<ImageConverter />);

    expect(screen.getByText('Convert to PNG')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Convert to PNG/i })).toBeDisabled();
    expect(screen.getByLabelText(/choose file/i)).toBeInTheDocument(); // Assuming input has a label or inferred label
    expect(screen.queryByText('Please select a file first.')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /converted/i })).not.toBeInTheDocument();
  });

  it('enables the convert button when a file is selected', () => {
    render(<ImageConverter />);
    const fileInput = screen.getByLabelText(/choose file/i); // Adjust based on actual label or role

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByRole('button', { name: /Convert to PNG/i })).not.toBeDisabled();
  });

  it('does not attempt conversion if no file is selected', async () => {
    render(<ImageConverter />);
    const convertButton = screen.getByRole('button', { name: /Convert to PNG/i });

    expect(convertButton).toBeDisabled(); // Ensure the button is disabled initially
    fireEvent.click(convertButton); // Attempt to click the disabled button

    // Expect no error message to appear, and convertImage not to be called
    expect(screen.queryByText('Please select a file first.')).not.toBeInTheDocument();
    expect(convertImage).not.toHaveBeenCalled();
  });


  it('shows loading state and then displays converted image on successful conversion', async () => {
    const mockFile = new File(['dummy content'], 'input.jpeg', { type: 'image/jpeg' });
    const mockConvertedFile = new File(['converted'], 'output.png', { type: 'image/png' });

    convertImage.mockResolvedValue(mockConvertedFile);

    render(<ImageConverter />);
    const fileInput = screen.getByLabelText(/choose file/i);
    const convertButton = screen.getByRole('button', { name: /Convert to PNG/i });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.click(convertButton);

    expect(screen.getByText('Converting...')).toBeInTheDocument();
    expect(convertButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Converting...')).not.toBeInTheDocument();
      expect(screen.getByText('Converted Image:')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Converted' })).toHaveAttribute('src', 'blob:http://localhost/mock-image-url');
      expect(screen.getByRole('link', { name: 'Download Converted Image' })).toHaveAttribute('href', 'blob:http://localhost/mock-image-url');
    });

    expect(convertImage).toHaveBeenCalledWith(mockFile);
    expect(convertButton).not.toBeDisabled();
  });

  it('displays an error message on conversion failure', async () => {
    const mockFile = new File(['dummy content'], 'input.jpeg', { type: 'image/jpeg' });

    convertImage.mockRejectedValue(new Error('Simulated conversion error'));

    render(<ImageConverter />);
    const fileInput = screen.getByLabelText(/choose file/i);
    const convertButton = screen.getByRole('button', { name: /Convert to PNG/i });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.click(convertButton);

    expect(screen.getByText('Converting...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Converting...')).not.toBeInTheDocument();
      expect(screen.getByText('Error during conversion. Please try again.')).toBeInTheDocument();
    });

    expect(convertImage).toHaveBeenCalledWith(mockFile);
    expect(convertButton).not.toBeDisabled();
    expect(screen.queryByRole('img', { name: /converted/i })).not.toBeInTheDocument();
  });

  it('clears error and converted image when a new file is selected', async () => {
    const mockFile1 = new File(['dummy content'], 'input1.jpeg', { type: 'image/jpeg' });
    const mockConvertedFile = new File(['converted'], 'output.png', { type: 'image/png' });

    convertImage.mockResolvedValue(mockConvertedFile);

    render(<ImageConverter />);
    const fileInput = screen.getByLabelText(/choose file/i);
    const convertButton = screen.getByRole('button', { name: /Convert to PNG/i });

    // Simulate first conversion
    fireEvent.change(fileInput, { target: { files: [mockFile1] } });
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(screen.getByText('Converted Image:')).toBeInTheDocument();
    });

    // Simulate selecting a new file
    const mockFile2 = new File(['new dummy content'], 'input2.gif', { type: 'image/gif' });
    fireEvent.change(fileInput, { target: { files: [mockFile2] } });

    expect(screen.queryByText('Converted Image:')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /converted/i })).not.toBeInTheDocument();
    expect(convertButton).not.toBeDisabled();
    expect(screen.getByText('Convert to PNG')).toBeInTheDocument(); // Button text should revert
  });
});