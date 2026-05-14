# companion-module-leader-zen
Companion module to load user presets on a Leader ZEN Waveform Monitor (LV5600, LV7600 etc) to be controlled from Stream Deck

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

The module allows Companion users to:

- Load user presets on Leader ZEN devices from Companion
- Provide button feedback when a preset has been successfully loaded
- Expose the last loaded preset as a Companion variable

## Configuration
- Device: List of supported devices to connect to (select your device from the list)
- Port Number: Default 23 
- Delay before sending commands (ms): Default 500 (0.5 seconds delay before sending command)

## Getting started development
- Install node v22 https://nodejs.org/en/download
- Install yarn https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable   `npm install --global yarn`
- Install Companion - configure Development mode and development module folder in settings
- https://bitfocus.io/companion
- Download from: https://user.bitfocus.io/login (requires signup/ login credentials)
- User guide: https://companion.free/user-guide/beta/
- github: https://github.com/bitfocus/companion

- Download this plugin repositry to the companion development folder 
- Open command line on companion development folder with admin privilages
- > `npm install`
- > `corepack enable`
- > `yarn install`
- > `yarn build` (or yarn / yarn dev from then on)
- Dist directory is genereated and yarn builds the project containing the plugin files for companion
- Companion will then auto load the plugin ready for you to test and use if dev mode is enabled
- > `yarn companion-module-build` to generate installation package for offline installation into the companion installation

## Authors and acknowledgment
Ed Smith (Leader Europe)

## License
MIT.

