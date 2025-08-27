@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0
cd..

echo ===== Requirements Synchronization =====
echo.

REM Check if both files exist
if not exist "requirements-dev.txt" (
    echo [X] requirements-dev.txt not found!
    pause
    exit /b 1
)

if not exist "requirements.txt" (
    echo [X] requirements.txt not found!
    pause
    exit /b 1
)

echo Synchronizing package versions from requirements-dev.txt to requirements.txt...
echo.

REM Create temporary file for new requirements.txt
set "temp_file=%TEMP%\requirements_temp_%RANDOM%.txt"
set "updated_count=0"

REM Process requirements.txt line by line
for /f "usebackq delims=" %%a in ("requirements.txt") do (
    set "line=%%a"
    
    REM Skip empty lines and comments
    if "!line!"=="" (
        echo.>> "%temp_file%"
    ) else if "!line:~0,1!"=="#" (
        echo !line!>> "%temp_file%"
    ) else (
        REM Extract package name (everything before ==, [, or space)
        set "package_name=!line!"
        
        REM Remove everything after [ if present
        for /f "tokens=1 delims=[" %%b in ("!package_name!") do set "package_name=%%b"
        
        REM Remove everything after == if present
        for /f "tokens=1 delims==" %%b in ("!package_name!") do set "package_name=%%b"
        
        REM Remove everything after space if present
        for /f "tokens=1 delims= " %%b in ("!package_name!") do set "package_name=%%b"
        
        if not "!package_name!"=="" (
            REM Look for this package in requirements-dev.txt
            set "dev_line="
            for /f "usebackq delims=" %%c in ("requirements-dev.txt") do (
                set "dev_check=%%c"
                if "!dev_check:~0,1!"=="#" (
                    REM Skip comments
                ) else (
                    REM Check if line starts with package name followed by = or [
                    echo !dev_check! | findstr /B /C:"!package_name!=" >nul 2>&1
                    if !ERRORLEVEL! equ 0 set "dev_line=!dev_check!"
                    
                    echo !dev_check! | findstr /B /C:"!package_name![" >nul 2>&1
                    if !ERRORLEVEL! equ 0 set "dev_line=!dev_check!"
                )
            )
            
            if not "!dev_line!"=="" (
                REM Extract version from dev requirements (everything after ==)
                for /f "tokens=2 delims==" %%d in ("!dev_line!") do set "dev_version=%%d"
                
                REM Extract current version from production requirements
                for /f "tokens=2 delims==" %%e in ("!line!") do set "prod_version=%%e"
                
                if not "!dev_version!"=="!prod_version!" (
                    REM Update the version in production requirements
                    echo !package_name!==!dev_version!>> "%temp_file%"
                    echo   - !package_name!: !prod_version! -^> !dev_version!
                    set /a updated_count+=1
                ) else (
                    REM Versions match, keep original line
                    echo !line!>> "%temp_file%"
                )
            ) else (
                REM Package not found in dev requirements, keep original
                echo !line!>> "%temp_file%"
            )
        ) else (
            echo !line!>> "%temp_file%"
        )
    )
)

REM Check for packages that are in dev but not in production
set "dev_only_found=0"

for /f "usebackq delims=" %%a in ("requirements-dev.txt") do (
    set "dev_line=%%a"
    
    REM Skip empty lines and comments
    if not "!dev_line!"=="" if not "!dev_line:~0,1!"=="#" (
        REM Extract package name
        set "dev_package=!dev_line!"
        
        REM Remove everything after [ if present
        for /f "tokens=1 delims=[" %%b in ("!dev_package!") do set "dev_package=%%b"
        
        REM Remove everything after == if present
        for /f "tokens=1 delims==" %%b in ("!dev_package!") do set "dev_package=%%b"
        
        REM Remove everything after space if present
        for /f "tokens=1 delims= " %%b in ("!dev_package!") do set "dev_package=%%b"
        
        if not "!dev_package!"=="" (
            REM Check if this package exists in production requirements
            findstr /B /C:"!dev_package!=" requirements.txt >nul 2>&1
            if !ERRORLEVEL! neq 0 (
                findstr /B /C:"!dev_package![" requirements.txt >nul 2>&1
                if !ERRORLEVEL! neq 0 (
                    if "!dev_only_found!"=="0" (
                        echo.
                        echo Development-only packages ^(not copied to production^):
                        set "dev_only_found=1"
                    )
                    echo   - !dev_package!
                )
            )
        )
    )
)

REM Replace original file with updated version
move "%temp_file%" requirements.txt >nul 2>&1

echo.
if "!updated_count!"=="0" (
    echo All package versions are already synchronized.
) else (
    echo Updated !updated_count! package version^(s^) in requirements.txt
)

echo.
echo Synchronization complete!
