// Company: Leader Electronics of Europe
// License: MIT
// Created by: Ed Smith 
// Date: 14/10/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons. 
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically genereated when module has connected 

import { runEntrypoint } from '@companion-module/base'
import { LVPresetModule } from './main.js'
import { UpgradeScripts } from './upgrades.js'

runEntrypoint(LVPresetModule, UpgradeScripts)
