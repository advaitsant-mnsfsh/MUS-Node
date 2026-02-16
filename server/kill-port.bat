@echo off
set PORT=8080
echo 🔍 Searching for processes on port %PORT%...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo 🔪 Killing process with PID: %%a
    taskkill /F /PID %%a
)

if %ERRORLEVEL% NEQ 0 (
    echo ✅ Port %PORT% is already clear.
) else (
    echo ✨ Port %PORT% has been cleared.
)
