@echo off
REM ============================================================
REM  FundForge - Windows setup launcher
REM  Double-click this file, or run it from a terminal.
REM  It just runs setup-windows.ps1 while bypassing the
REM  PowerShell execution-policy prompt.
REM ============================================================
echo Starting FundForge setup...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-windows.ps1" %*
echo.
echo Setup script finished. Press any key to close this window.
pause >nul
