Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Starting SoundWave Ad-Free Music Platform" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

$baseDir = $PSScriptRoot

Write-Host "`n[1/3] Starting Backend API (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend'; node src/index.js"

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Desktop Web App (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\web-app'; npm.cmd run dev"

Start-Sleep -Seconds 2

Write-Host "[3/3] Starting Android Mobile App (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\android-app'; npm.cmd run dev"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  All services launched successfully!" -ForegroundColor Green
Write-Host "  - Backend API:    http://localhost:5000" -ForegroundColor Yellow
Write-Host "  - Desktop Web:    http://localhost:3000" -ForegroundColor Yellow
Write-Host "  - Android Mobile: http://localhost:3001" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Green

