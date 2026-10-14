// Company: Leader Electronics of Europe
// License: MIT
// Created by: Ed Smith 
// Date: 14/10/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons. 
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically generated when module has connected 

import {
    combineRgb,
    type CompanionPresetDefinitions,
} from '@companion-module/base'

import type { LVPresetModule } from './main.js'

export function getPresets(
    instance: LVPresetModule
): CompanionPresetDefinitions {
    const defs: CompanionPresetDefinitions = {}

    for (const p of instance.userPresets) {
        defs[`load_${p.id}`] = {
            type: 'button',
            category: 'User Presets',
            name: `Load ${p.label}`,

            style: {
                text: p.label,
                size: '14',
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 102, 204),
            },

            steps: [
                {
                    down: [
                        {
                            actionId: 'load_preset',
                            options: {
                                presetId: p.id,
                            },
                        },
                    ],
                    up: [],
                },
            ],

            feedbacks: [
                {
                    feedbackId: 'preset_success',
                    options: {
                        presetId: p.id,
                    },
                    style: {
                        bgcolor: combineRgb(0, 200, 0),
                        color: combineRgb(0, 0, 0),
                    },
                },
            ],
        }
    }

    return defs
}
