## How to Use

1. Modify config.json in the gateway according to the current situation:
    - [servAddr]: DAN server address
    - [apiKey]: User identity. (You can register at <https://www.opendan.ai/>)
    - [nodeName]: DAN node identity. Do not use the same nodeName in different nodes.
    - [webuiLocalUrl]: Local webui web URL
    - [supportModels]: Some of the models we provide. Generally, do not modify it.
2. If you want to change webui startup parameters, you can change "COMMANDLINE_ARGS" in `win_launch.bat` or `linux_launch.sh`.
3. If you are using Windows, open `win_launch.bat`.
4. If you are using Linux, open the terminal and run bash `linux_launch.bash`.

## Attention
1. The first startup will take a long time to download the webui and corresponding model. Please be patient and wait.
