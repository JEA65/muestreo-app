@echo off
cd /d "%~dp0"
echo Abrir http://127.0.0.1:4173 en el navegador.
echo Mantener esta ventana abierta mientras se prueba la app.
node server.mjs
pause
