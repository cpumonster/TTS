/**
 * 다운로드 유틸리티 함수들
 */

export const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadJSON = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadAudio = (audioUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = audioUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadImage = (imageUrl: string, filename: string) => {
  // data URL인 경우 직접 다운로드
  if (imageUrl.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 일반 URL인 경우 fetch 후 다운로드
  fetch(imageUrl)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Failed to download image:', error);
    });
};

export const downloadAllImagesAsZip = async (images: { url: string; filename: string }[]) => {
  // Note: 브라우저에서 ZIP 생성은 라이브러리가 필요합니다 (JSZip 등)
  // 현재는 개별 다운로드로 구현
  for (const { url, filename } of images) {
    downloadImage(url, filename);
    // 브라우저 다운로드 제한을 피하기 위해 약간의 딜레이 추가
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};

export const createTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
};

