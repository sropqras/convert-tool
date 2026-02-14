// imageUtils.js

import fileType from 'file-type';
import imageConversion from 'image-conversion';

export const convertImage = async (file) => {
  const buffer = await file.arrayBuffer();
  // file-type library is async. So, use await here.
  const type = await fileType.fromBuffer(buffer);

  if (!type) {
    console.error("Could not determine file type.");
    return null;
  }

  const { ext } = type;

  // The original prompt mentions 'jpg', 'jpeg', 'png', 'gif', 'svg', 'ico' as supported output for image-conversion library,
  // but image-conversion only seems to support 'png', 'jpeg', 'webp', 'bmp', 'gif', 'ico' for output formats.
  // The input can be anything the browser can decode.
  // For simplicity, let's convert everything to 'png' as the example suggests.
  // If the input is already SVG or ICO and the user wants to keep it as such,
  // this logic would need to be enhanced.
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'ico'].includes(ext)) {
    // imageConversion library expects a Blob or File object directly, not a buffer.
    // It can also take a base64 string or an image URL.
    // Let's pass the original File object to imageConversion.
    const convertedBlob = await imageConversion.compressAccurately(file, { type: 'image/png' });
    return new File([convertedBlob], `${file.name.replace(/\.\w+$/, '')}.png`, { type: 'image/png' });
  }

  return null;
};