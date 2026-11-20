param(
    [switch]$Dev
)

Write-Host "Starting Heart Disease Prediction System..." -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$uvicornArgs = @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000")
if ($Dev) {
    $uvicornArgs += "--reload"
    Write-Host "Dev mode: auto-reload enabled." -ForegroundColor Yellow
} else {
    Write-Host "Fast mode: no auto-reload (use -Dev for reload)." -ForegroundColor Yellow
}

$backend = Start-Process -FilePath "python" -ArgumentList $uvicornArgs -WorkingDirectory "$root\backend" -PassThru -WindowStyle Normal
Write-Host "Backend started  -> http://127.0.0.1:8000 (PID: $($backend.Id))" -ForegroundColor Green

$frontend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$root\frontend" -PassThru -WindowStyle Normal
Write-Host "Frontend started -> http://localhost:5173  (PID: $($frontend.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "Press Enter to stop both servers..." -ForegroundColor Yellow
Read-Host

Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
Write-Host "Servers stopped." -ForegroundColor Red