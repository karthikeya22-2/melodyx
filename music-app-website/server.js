// Zero-dependency local development server for Melodyx Website
// Supports Desktop & Android Mobile (on local Wi-Fi) with exact MIME types and clean URLs
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.apk': 'application/vnd.android.package-archive',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg'
};

function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push({ name, address: iface.address });
            }
        }
    }
    return ips;
}

const server = http.createServer((req, res) => {
    // Basic security: sanitize url path
    let decodedPath;
    try {
        decodedPath = decodeURIComponent(req.url.split('?')[0]);
    } catch {
        res.writeHead(400);
        return res.end('Bad Request');
    }

    if (decodedPath === '/') decodedPath = '/index.html';

    let filePath = path.join(ROOT, decodedPath);

    // If file doesn't exist, try appending .html for clean URLs (like Vercel)
    if (!fs.existsSync(filePath)) {
        if (fs.existsSync(filePath + '.html')) {
            filePath = filePath + '.html';
        } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
            filePath = path.join(filePath, 'index.html');
        } else {
            // 404
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
            return res.end(`
                <!DOCTYPE html>
                <html>
                <head><title>404 Not Found</title></head>
                <body style="font-family:sans-serif; text-align:center; padding:50px;">
                    <h2>404 - Page Not Found</h2>
                    <p><a href="/" style="color:#d32f2f;">Return to Melodyx Home</a></p>
                </body>
                </html>
            `);
        }
    }

    // Check directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Additional headers for APK downloads
        const headers = {
            'Content-Type': contentType,
            'Content-Length': stat.size,
            'Cache-Control': 'no-cache'
        };

        if (ext === '.apk') {
            headers['Content-Disposition'] = 'attachment; filename="Melodyx.apk"';
        }

        res.writeHead(200, headers);
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error: ' + err.message);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(56));
    console.log('   Melodyx Website Server is running!');
    console.log('='.repeat(56));
    console.log(`\n  🖥️  Desktop / PC Browser:`);
    console.log(`     http://localhost:${PORT}`);
    
    const localIPs = getLocalIPs();
    if (localIPs.length > 0) {
        console.log(`\n  📱 Android Mobile Browser (same Wi-Fi):`);
        localIPs.forEach(ip => {
            console.log(`     http://${ip.address}:${PORT}  (${ip.name})`);
        });
    }

    console.log(`\n  📦 APK Direct Download:`);
    console.log(`     http://localhost:${PORT}/apk/Melodyx.apk`);
    console.log('\n  Press Ctrl+C to stop the server.');
    console.log('='.repeat(56) + '\n');
});
