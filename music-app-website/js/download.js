// Melodyx APK Download & Installation Controller

document.addEventListener('DOMContentLoaded', () => {
  const downloadBtns = document.querySelectorAll('.btn-download-apk');
  const config = window.APP_CONFIG || {};

  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      initiateApkDownload();
    });
  });

  // Setup dynamic version and size attributes on any elements with data-bind
  document.querySelectorAll('[data-bind]').forEach(el => {
    const key = el.getAttribute('data-bind');
    if (config[key]) {
      el.textContent = config[key];
    }
  });
});

function initiateApkDownload() {
  const config = window.APP_CONFIG || {};
  const downloadUrl = config.downloadUrl || 'apk/Melodyx.apk';
  const fallbackUrl = config.fallbackDownloadUrl;

  showDownloadNotice(`Downloading Melodyx ${config.version || 'v2.1.0'} (${config.apkSize || '6.35 MB'})...`);

  // Direct programmatic download anchor
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `Melodyx-${config.version || '2.1.0'}.apk`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Verification fallback: if local file isn't reachable (e.g. standalone CDN)
  setTimeout(() => {
    showDownloadNotice('Download initiated! If your download did not start automatically, <a href="' + (fallbackUrl || downloadUrl) + '" style="text-decoration:underline;font-weight:bold;color:#FFF;">click here to retry</a>.', 8000);
  }, 2500);
}

function showDownloadNotice(message, duration = 5000) {
  let toast = document.getElementById('downloadToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'downloadToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = '9999';
    toast.style.backgroundColor = '#0F172A';
    toast.style.color = '#FFFFFF';
    toast.style.padding = '14px 20px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.maxWidth = '90vw';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }
  }, duration);
}
