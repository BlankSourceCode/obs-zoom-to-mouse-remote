/**
 * OBS Zoom to Mouse Remote
 * A small nodejs script forward the current mouse position to a UDP socket
 * Copyright (c) BlankSourceCode.  All rights reserved.
 */

const koffi = require("koffi");
const udp = require("dgram");
const { program, InvalidArgumentError } = require("commander");

// Add the command line options
program
    .name("obs-zoom-to-mouse-remote")
    .description("A small udp socket client designed to send the mouse position to obs-zoom-to-mouse over the network")
    .version("1.0.0", "-v, --version")
    .requiredOption("-h, --host <string>", "specify hostname/ip of obs machine (default: localhost)", (value) => {
        return value;
    })
    .option("-p, --port <number>", "specify custom udp port (default: 12345)", (value) => {
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new InvalidArgumentError("Not a number.");
        }
        return parsedValue;
    })
    .option("-d, --delay <number>", "specify custom poll delay in ms (default: 10)", (value) => {
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new InvalidArgumentError("Not a number.");
        } else if (parsedValue < 1 || parsedValue > 1000) {
            throw new InvalidArgumentError("Must be between 1 and 1000");
        }
        return parsedValue;
    });;

// Parse command line
program.parse(process.argv);
const opts = program.opts();
const host = opts.host || "localhost";
const port = opts.port || 12345;
const delay = opts.delay || 10;

let winLib = null;
let x11Lib = null;
let osxLib = null;

function getLib(...paths) {
    for (const i of paths) {
        try {
            return koffi.load(i);
        } catch {
        }
    }

    return null;
}

function loadLibrary() {
    if (process.platform === "win32") {
        const lib = getLib("User32");
        if (lib) {
            koffi.struct("POINT", {
                x: "int",
                y: "int"
            });

            winLib = {
                SetProcessDPIAware: lib.func("int SetProcessDPIAware()"),
                GetCursorPos: lib.func("int GetCursorPos(_Out_ POINT*)"),
                point: {}
            }
            winLib.SetProcessDPIAware();
        }
    } else if (process.platform === "Linux") {
        const lib = getLib("X11.so.6");
        if (lib) {
            x11Lib = {
                XOpenDisplay: lib.func("intptr XOpenDisplay(char *)"),
                XDefaultRootWindow: lib.func("ulong XDefaultRootWindow(intptr)"),
                XQueryPointer: lib.func("int XQueryPointer(intptr, ulong, _Out_ ulong*, _Out_ ulong*, _Out_ int*, _Out_ int*, _Out_ int*, _Out_ int*, _Out_ uint*)"),
                XCloseDisplay: lib.func("int XCloseDisplay(intptr)")
            }

            const display = x11Lib.XOpenDisplay(null);
            const root = x11Lib.XDefaultRootWindow(display);

            if (!display || !root) {
                x11Lib = null;
            } else {
                x11Lib.display = display;
                x11Lib.root = root;
                x11Lib.params = {
                    rootX: [0],
                    rootY: [0],
                    winX: [0],
                    winY: [0],
                    mask: [0]
                }
            }
        }
    } else if (process.platform === "darwin") {
        const lib = getLib("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics");
        if (lib) {
            koffi.struct("CGPoint", {
                x: "double",
                y: "double"
            });

            osxLib = {
                CGEventCreate: lib.func("intptr CGEventCreate(intptr)"),
                CGEventGetLocation: lib.func("CGPoint CGEventGetLocation(intptr)"),
                CFRelease: lib.func("void CFRelease(intptr)")
            }
        }
    }
}

function getMousePosition() {
    const mouse = { x: 0, y: 0 };

    if (process.platform === "win32") {
        if (winLib) {
            winLib.GetCursorPos(winLib.point);
            mouse.x = winLib.point.x;
            mouse.y = winLib.point.y;
        }
    } else if (process.platform === "linux") {
        if (x11Lib) {
            x11Lib.XQueryPointer(x11Lib.display, x11Lib.root, x11Lib.params.rootX, x11Lib.params.rootY, x11Lib.params.winX, x11Lib.params.winY, x11Lib.params.mask);
            mouse.x = x11Lib.params.winX[0],
            mouse.y = x11Lib.params.winY[0]
        }
    } else if (process.platform === "darwin") {
        if (osxLib) {
            const e = osxLib.CGEventCreate(0);
            const point = osxLib.CGEventGetLocation(e);
            mouse.x = point.x;
            mouse.y = point.y;
            osxLib.CFRelease(e);
        }
    }

    return mouse;
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    console.log(``);
    console.log(`-----------------------------------`);
    console.log(`Welcome to OBS-Zoom-To-Mouse-Remote`);
    console.log(`-----------------------------------`);
    console.log(`OBS host is expected on ${host}:${port}`);
    console.log(``);
    console.log(`1. Open OBS on ${host} machine`);
    console.log(`2. Add obs-zoom-to-mouse.lua script`);
    console.log(`3. In settings check 'Enable remote mouse listener' and set 'Port' to ${port}`);
    console.log(``);

    loadLibrary();

    const client = udp.createSocket("udp4");

    let isRunning = true;
    while (isRunning) {
        const pos = getMousePosition();
        const msg = `${pos.x} ${pos.y}`;
        const data = Buffer.from(msg);
        client.send(data, port, host, function (error) {
            if (error) {
                client.close();
                isRunning = false;
            }
        });

        await wait(delay);
    }

    console.log("Disconnected.")
}

run();