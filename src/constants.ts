// Company: Leader Electronics of Europe
// License: MIT
// Created by: Ed Smith 
// Date: 14/10/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons. 
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically generated when module has connected 

// CREATE 60 PREDEFINED USER PRESETS FOR ZEN
export const USER_PRESETS = 
    new Array(60)
        .fill(null)
        .map((_, i) => ({
            id: `${i + 1}`, 
            label: `Preset ${i + 1}`,
            }));
