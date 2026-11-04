@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "DEMO_PORT=8080"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:%DEMO_PORT%/"
  py -3 -m http.server %DEMO_PORT% --bind 127.0.0.1
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:%DEMO_PORT%/"
  python -m http.server %DEMO_PORT% --bind 127.0.0.1
  goto :eof
)
echo 未检测到 Python 3。请直接双击 index.html，或参照 README 使用 Nginx/IIS。
pause
