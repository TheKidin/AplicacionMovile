@echo off
echo ============================================
echo    CLINOVA - Descargar APK por WiFi
echo ============================================
echo.
echo    Tu telefono y PC deben estar en la MISMA red WiFi
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo    Abre en tu telefono:
        echo    http://%%b:8888
        echo.
        echo    Click en "app-debug.apk" para descargar
        echo    Presiona Ctrl+C para parar el servidor
        echo.
        npx -y serve android/app/build/outputs/apk/debug -l 8888 --no-clipboard
        goto :end
    )
)

:end
pause
