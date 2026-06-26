@echo off
echo Starting Pavan-GPT Django Backend...
cd "%~dp0\backend"
..\_venv\Scripts\python.exe manage.py runserver
if errorlevel 1 (
    echo.
    echo Trying fallback venv path...
    ..\.venv\Scripts\python.exe manage.py runserver
)
pause
