export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { width: number; height: number; x: number; y: number },
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');

  //Ограничиваем размер обрезки, чтобы не было увеличения
  const maxWidth = Math.min(image.width, pixelCrop.width);
  const maxHeight = Math.min(image.height, pixelCrop.height);

  canvas.width = maxWidth;
  canvas.height = maxHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2D context');
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    maxWidth,
    maxHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const croppedImageUrl = window.URL.createObjectURL(blob);
      resolve(croppedImageUrl);
    }, 'image/jpeg');
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
