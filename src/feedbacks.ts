// Company: Leader Electronics of Europe 2026
// License: MIT
// Created by: Ed Smith 
// Date: 14/10/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons. 
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically generated when module has connected 

import type {
    CompanionFeedbackDefinitions,
} from '@companion-module/base'

import { combineRgb } from '@companion-module/base'
import type { LVPresetModule } from './main.js'

export function getFeedbacks(
    instance: LVPresetModule
): CompanionFeedbackDefinitions {
    const choices = instance.userPresets

    return {
        preset_success: {
            type: 'boolean',
            name: 'Preset Selected',
            description:
                'Turns user preset button green when selected',
            defaultStyle: {
                bgcolor: combineRgb(0, 200, 0),
                color: combineRgb(0, 0, 0),
            },

            options: [
                {
                    type: 'dropdown',
                    id: 'presetId',
                    label: 'Preset',
                    default: choices[0]?.id ?? '',
                    choices,
                },
            ],

            callback: (fb) => {
                return (
                    instance.lastPresetId ===
                    String(fb.options.presetId ?? '')
                )
            },
        },
    }
}
