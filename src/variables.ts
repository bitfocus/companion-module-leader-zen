// Company: Leader Electronics of Europe
// License: MIT
// Created by: Ed Smith
// Date: 14/10/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons.
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically generated when module has connected

import type { CompanionVariableDefinition } from '@companion-module/base'
import type { LVPresetModule } from './main.js'

export function initVariables(instance: LVPresetModule): void {
	const variables: CompanionVariableDefinition[] = [
		{
			variableId: 'last_loaded_preset',
			name: 'Last Loaded Preset',
		},
	]

	instance.setVariableDefinitions(variables)

	instance.setVariableValues({
		last_loaded_preset: '',
	})
}
