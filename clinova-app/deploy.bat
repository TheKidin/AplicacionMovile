@echo off
echo ============================================
echo    CLINOVA - Build y Deploy Movil
echo ============================================
echo.

:: Configurar Java y Node.js
set JAVA_HOME=D:\AndroidStudio\jbr
set PATH=C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs;%PATH%

:: Paso 1: Build web
echo [1/4] Construyendo app web...
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo el build web
    pause
    exit /b 1
)

:: Paso 2: Sync Capacitor
echo [2/4] Sincronizando con Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Fallo el sync
    pause
    exit /b 1
)

:: Paso 3: Build APK
echo [3/4] Construyendo APK...
cd android
call gradlew.bat assembleDebug
cd ..
if errorlevel 1 (
    echo ERROR: Fallo el build del APK
    pause
    exit /b 1
)

:: Paso 4: Servir APK por WiFi
echo.
echo ============================================
echo    APK LISTO - Descargalo desde tu telefono
echo ============================================
echo.
echo    Archivo: android\app\build\outputs\apk\debug\app-debug.apk
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "172."') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo    Abre esto en tu telefono Android:
        echo    http://%%b:8888
        echo.
        echo    (Misma red WiFi que la PC)
        echo    Presiona Ctrl+C para parar
        echo.
        npx -y serve android\app\build\outputs\apk\debug -l 8888 --no-clipboard
        goto :end
    )
)

:end
pause
