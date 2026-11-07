// Melodyx APK Download & Installation Controller

document.addEventListener('DOMContentLoaded', () => {
  const config = window.APP_CONFIG || {};
  const downloadBtns = document.querySelectorAll('.btn-download-apk');
  const apkPath = './apk/Melodyx.apk';

  downloadBtns.forEach(btn => {
    // Ensure direct native download attributes
    btn.setAttribute('href', apkPath);
    btn.setAttribute('download', 'Melodyx.apk');

    btn.addEventListener('click', () => {
      // Show notice without blocking browser native download
      showDownloadNotice(`Downloading Melodyx ${config.version || 'v2.1.0'} (${config.apkSize || '6.35 MB'})... Check your downloads bar.`);
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

function showDownloadNotice(message, duration = 6000) {
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
