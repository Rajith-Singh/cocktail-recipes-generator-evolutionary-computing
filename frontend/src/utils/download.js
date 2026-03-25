/**
 * Download utility: saves any HTML element (chart, canvas, SVG) as a PNG or SVG file.
 */

export const downloadSvgAsPng = (svgId, filename = 'chart.png') => {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const canvas = document.createElement('canvas');
  const img = new Image();
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    canvas.width = img.width || 800;
    canvas.height = img.height || 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#020804';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
};

export const downloadElementAsPng = (elementId, filename = 'chart.png') => {
  const el = document.getElementById(elementId);
  if (!el) return;
  import('html2canvas').then(({ default: html2canvas }) => {
    html2canvas(el, { backgroundColor: '#020804' }).then(canvas => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }).catch(() => {
    // Fallback for SVGs inside recharts
    const svgs = el.querySelectorAll('svg');
    if (svgs.length > 0) downloadSvgElementAsPng(svgs[0], filename);
  });
};

export const downloadSvgElementAsPng = (svgEl, filename = 'chart.png') => {
  if (!svgEl) return;
  const data = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([data], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svgEl.viewBox?.baseVal?.width || svgEl.clientWidth || 800;
    canvas.height = svgEl.viewBox?.baseVal?.height || svgEl.clientHeight || 500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#020804';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
};

export const downloadJSON = (data, filename = 'data.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
