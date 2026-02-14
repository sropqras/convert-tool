import { convertImage } from './imageUtils';
import { fileTypeFromBuffer } from 'file-type';
import imageConversion from 'image-conversion';

// Mock file-type and image-conversion
jest.mock('file-type');
jest.mock('image-conversion');

// Helper function to create a mock File object
const createMockFile = (name, type, content = 'mock content') => ({
  name,
  type,
  arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(8))), // Mock arrayBuffer
  // Add other File properties if needed by convertImage
});

describe('convertImage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fileTypeFromBuffer.mockReset();
    imageConversion.compressAccurately.mockReset();
  });

  it('should convert a supported image file to PNG', async () => {
    const mockFile = createMockFile('test.jpeg', 'image/jpeg');
    const mockConvertedBlob = new Blob(['converted content'], { type: 'image/png' });

    fileTypeFromBuffer.mockResolvedValue({ ext: 'jpeg', mime: 'image/jpeg' });
    imageConversion.compressAccurately.mockResolvedValue(mockConvertedBlob);

    const result = await convertImage(mockFile);

    expect(fileTypeFromBuffer).toHaveBeenCalledWith(expect.any(ArrayBuffer));
    expect(imageConversion.compressAccurately).toHaveBeenCalledWith(mockFile, { type: 'image/png' });
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test.png');
    expect(result.type).toBe('image/png');
  });

  it('should return null if file type cannot be determined', async () => {
    const mockFile = createMockFile('unknown.xyz', 'application/octet-stream');

    fileTypeFromBuffer.mockResolvedValue(undefined); // Simulate unknown file type

    const result = await convertImage(mockFile);

    expect(fileTypeFromBuffer).toHaveBeenCalledWith(expect.any(ArrayBuffer));
    expect(imageConversion.compressAccurately).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null if file type is not supported for conversion', async () => {
    const mockFile = createMockFile('document.pdf', 'application/pdf');

    fileTypeFromBuffer.mockResolvedValue({ ext: 'pdf', mime: 'application/pdf' });

    const result = await convertImage(mockFile);

    expect(fileTypeFromBuffer).toHaveBeenCalledWith(expect.any(ArrayBuffer));
    expect(imageConversion.compressAccurately).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should handle errors during image conversion gracefully', async () => {
    const mockFile = createMockFile('error.png', 'image/png');

    fileTypeFromBuffer.mockResolvedValue({ ext: 'png', mime: 'image/png' });
    imageConversion.compressAccurately.mockRejectedValue(new Error('Conversion error'));

    await expect(convertImage(mockFile)).rejects.toThrow('Conversion error');

    expect(fileTypeFromBuffer).toHaveBeenCalledWith(expect.any(ArrayBuffer));
    expect(imageConversion.compressAccurately).toHaveBeenCalledWith(mockFile, { type: 'image/png' });
  });

  // Add more test cases for different supported input types if necessary
  it('should convert a GIF file to PNG', async () => {
    const mockFile = createMockFile('test.gif', 'image/gif', 'mock gif content');
    const mockConvertedBlob = new Blob(['converted png content'], { type: 'image/png' });

    fileTypeFromBuffer.mockResolvedValue({ ext: 'gif', mime: 'image/gif' });
    imageConversion.compressAccurately.mockResolvedValue(mockConvertedBlob);

    const result = await convertImage(mockFile);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test.png');
    expect(result.type).toBe('image/png');
  });
});
