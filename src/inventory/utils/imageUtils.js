export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
    return imagePath;
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  const backendUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${backendUrl}${cleanPath}`;
};