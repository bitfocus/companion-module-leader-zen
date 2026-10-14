// Company: Leader Electronics of Europe 2026
// License: MIT
// Created by: Ed Smith 
// Date: 14/10/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons. 
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically genereated when module has connected 

import type { CompanionActionDefinitions } from '@companion-module/base'
import type { LVPresetModule } from './main.js'
import { safeSend } from './telnet.js'

export function getActions(
    instance: LVPresetModule
): CompanionActionDefinitions {
    const choices = instance.userPresets

    return {
        load_preset: {
            name: 'Load preset',
            description: 'Load the selected preset on the ZEN device',
            options: [
                {
                    type: 'dropdown',
                    id: 'presetId',
                    label: 'Preset',
                    default: choices[0]?.id ?? '',
                    choices,
                },
            ],

            callback: async (action) => {
                const presetId = String(action.options.presetId ?? '')
                safeSend(instance, `RCLL ${presetId}`)
            },
        },
    }
}
