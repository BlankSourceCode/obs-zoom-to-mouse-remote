# OBS-Zoom-To-Mouse-Remote

An simple addon to [obs-zoom-to-mouse.lua](https://github.com/BlankSourceCode/obs-zoom-to-mouse) that allows you to control the zoom location from a remote machine.

The idea is you have a dual box setup, where OBS is installed on one machine, but you are actually streaming the display of another machine (via NDI/CaptureCard/etc.). You want to zoom in OBS so that the capture source looks bigger, but you want the zoom to track the mouse on your non-obs machine, so that as you move it around doing your work/game/whatever, OBS on the other machine will be showing a zoomed in version of whatever is around the mouse.

Built with [OBS v30.0.0](https://obsproject.com/download) and [luajitsocket](https://github.com/CapsAdmin/luajitsocket)

In theory works on **Windows**, **Linux**, and **Mac**

## Prerequisites
1. Download the socket support version of [obs-zoom-to-mouse.lua](https://github.com/BlankSourceCode/obs-zoom-to-mouse/blob/remote/obs-zoom-to-mouse.lua) (from the special branch)
1. Download the additional [ljsocket.lua](https://github.com/BlankSourceCode/obs-zoom-to-mouse-remote/blob/main/ljsocket.lua) file (from this repo)
1. Move the `ljsocket.lua` file next to `obs-zoom-to-mouse.lua` (They must be in the same folder, but you **don't** need to add `ljsocket.lua` to OBS)
1. Follow the setup instructions from the [obs-zoom-to-mouse.lua readme](https://github.com/BlankSourceCode/obs-zoom-to-mouse/) to add the zoom script to OBS
1. Enable `Allow any zoom source`
1. Select the `Zoom Source` that corrisponds to your non-obs machine
1. Enable `Set manual source position`
1. Set the X/Y/Width/Height settings to match the position of the source on your non-obs machine
1. Enable `Enable remote mouse listener`

## Install
1. Download the latest release of `obs-zoom-to-mouse-remote`
1. Copy the download to your non-obs machine
1. Run `obs-zoom-to-mouse-remote` using the following command:
   1. `obs-zoom-to-mouse-remote.exe --host <OBS-PC-Host>`
   1. *OBS-PC-Host* is the ip address or host name of the OBS machine that is running the socket server script

Note: You may need to add the socket port to your firewall


## Usage
1. See [obs-zoom-to-mouse.lua readme](https://github.com/BlankSourceCode/obs-zoom-to-mouse/) for using the OBS script
1. Run `obs-zoom-to-mouse-remote.exe --help` to see command line options
   1. **--port** The socket port to use. This must match the port specified in the `obs-zoom-to-mouse.lua` script settings
   1. **--host** The hostname/ip of the machine running `obs-zoom-to-mouse.lua`
   1. **--delay** How often the mouse position is sent to the socket (in milliseconds). This should match the delay specifed in the `obs-zoom-to-mouse.lua`
1. Press the `toggle zoom` hotkey on OBS machine
1. Move the mouse on your non-OBS machine
1. Press `CTRL + C` to exit (or close the window)

## Development Setup
* Clone this repo
* Run `npm install`
* Run `node src/server.js`

## Compile packages
* Clone this repo
* Run `npm install`
* Run `npm install -g pkg`
* Run `npm run package`
* Packages will be built to `/dist`

##

Want to support me staying awake long enough to add some more features?

<a href="https://www.buymeacoffee.com/blanksourcecode" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

