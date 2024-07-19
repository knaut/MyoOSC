# MyoOSC

A Javascript command-line application that converts realtime data from the Myo Armband to OSC (Open Sound Control).

## Updated July 2024

This project is revived after many years due to a need to use the Myo Armbands (now unsupported/out of production) in an interactive multimedia project.

New features:
- 100+ distinct OSC messages for dual gesture control (left hand fist + right hand wave out, etc.)
- EMG smoothing algorithms
- discriminating gestures based on pitch orientaion, e.g. a fist pointed at the ground sends a different signal than a fist pointed at the sky.

The goal is to create a fully handsfree spatial interface to control visualizer and musical applications via Open Sound Control (i.e. Ableton, TouchDesigner, etc.)

Due to the legacy nature of the system this code is written targeting Node v10. Extreme backward compatibility is a hard requirement for the project.

# What's it for?

The Myo Armbands are a great wearable device for gesture recognition. You can access data from their on-board EMG sensors, accelerometer, gyroscope, and magnetometer.

OSC (Open Sound Control) is a protocol for transmitting realtime data over a network. It's commonly used in creative applications like Ableton, Resolume, VDMX, and others. It's similar to and almost as ubiquitous as MIDI.

MyoOSC lets you use one or more Myos to control these apps and their effects in realtime.

I use MyoOSC to produce my own installation works that you can learn more about here (patreon.com/knautwerk) and here (werk.knaut.net).

# How to get it

MyoOSC relies on Node and some dependency packages. If you don't have Node already, install it from the website: https://nodejs.org/

You will also need NPM (Node Package Manager) if you don't already have it: https://www.npmjs.com/package/download

Then, download the repo. Navigate to it in your file structure in the command line. For example:

	cd ~/MyUserName/Downloads/MyoOSC

Once in the MyoOSC folder, install its dependencies:
	
	npm install

If everything's installed correctly, run the command:

	node app

The app should start and you should see a port number appear. 41234 is the default:

	OSC Port: 41234

You can recieve incoming OSC messages at this port.

# Messages

MyOSC provides a set of customized messages based off of the Myo data. A typical message looks like:

	address: 'myo/0/roll',
	args: 0.5

The first line is the address, which is a URL-like structure. The second is the actual value of the message, usually a number or an array of numbers.

The "0" in the address refers to the Myo index. If you have more than one Myo, you will have another address for 'myo/1/roll', 'myo/2/roll', etc.

These are the following messages MyoOSC provides.

## EMG

	address: 'myo/%index%/emg'
	args: array of 8 values, one for each EMG sensor.

## Orientation
### Roll

	address: 'myo/%index%/roll',
	args: floating number
	
### Pitch

	address: 'myo/%index%/pitch',
	args: floating number

Yaw isn't provided due to occasional unreliability. 

Myo must be in default calibration (LED pointing towards elbow) for the following to work.

### atSky

	address: 'myo/%index%/atSky',
	args: boolean number (1 or 0)

### atForward

	address: 'myo/%index%/atForward',
	args: boolean number (1 or 0)

### atGround

	address: 'myo/%index%/atGround',
	args: boolean number (1 or 0)

## Gestures
### Fist

	address: 'myo/%index%/fist',
	args: boolean number (1 or 0)

### Wave In

	address: 'myo/%index%/wave_in',
	args: boolean number (1 or 0)

### Wave Out

	address: 'myo/%index%/wave_out',
	args: boolean number (1 or 0)

### Fingers Spread

	address: 'myo/%index%/fist',
	args: boolean number (1 or 0)

Double-tap is disabled, but will be added in the future

## Hits (Gyroscope)

Used to determine when the Myo surpasses a certain speed, such as a "hit" or other sudden movement.

	address: 'myo/%index%/hit',
	args: boolean number (1 or 0)

## Utilities
### Bluetooth Strength
	
	address: 'myo/%index%/bluetooth_strength',
	args: floating number

### Battery Level
	
	address: 'myo/%index%/battery_level',
	args: floating number

# Credits
Special thanks to TheAlphaNerd, maintainer of the node-osc project, which makes MyoOSC possible.
This code is inspired by a forked version of samyk's myo-osc project.

# Support
MyoOSC is in active development and its API & messages may change in the future.

If you enjoy or use this software, consider pledging on my Patreon page (http://www.patreon.com/knautwerk), and get sweet rewards in the process.

