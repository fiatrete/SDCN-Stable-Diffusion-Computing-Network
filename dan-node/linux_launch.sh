#!/usr/bin/bash

currentDir=$(pwd)

if [ "$EUID" -ne 0 ]
then
    sudo apt install zip
else
    apt install zip
fi
# download webui
fileName="stable-diffusion-webui-master.zip"
file="stable-diffusion-webui-master"
if [[ ! -d $currentDir/$file ]]
then
    wget -O $fileName https://huggingface.co/datasets/fiatrete/dan-used-apps/resolve/main/stable-diffusion-webui-master-linux-1.0.0.zip
    unzip $fileName
fi

export COMMANDLINE_ARGS="--listen --api"

# set venv source
venvDir="${currentDir}/${file}/venv"
if [[ -f "$venvDir"/bin/activate ]]
then
    echo use venv source
    source "$venvDir"/bin/activate
fi

python3 gateway/gateway.py
