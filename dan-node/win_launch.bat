@echo off

rem Define the URL and destination file path to download

set folder_name=stable-diffusion-webui-master
set url="https://huggingface.co/datasets/fiatrete/dan-used-apps/resolve/main/stable-diffusion-webui-master-win-1.0.0.zip"
set file_name=stable-diffusion-webui-master.zip
set target_file=%~dp0/%folder_name%
if not exist "%folder_name%" (
    rem download webui
    bitsadmin /transfer myDownloadJob /download /priority normal %url% "%CD%\%file_name%"
    rem uncompress webui
    powershell "Expand-Archive -LiteralPath '%file_name%' -DestinationPath '%target_file%'"
) else (
    echo webui already exits
)

rem set Python path
set PYTHON_FILE=stable-diffusion-webui-master\Python310

rem set webui setup parameters
set COMMANDLINE_ARGS=--listen --api

rem run Python script
%PYTHON_FILE%\python.exe gateway\gateway.py
pause