// Company: Leader Electronics of Europe
// License: MIT
// Created by: Ed Smith 
// Date: 14/10/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons. 
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically generated when module has connected 

import { type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
      host: string
      port: number
      model: string
      sendOnConnectDelayMs?: number
    }

export function getConfigFields(): SomeCompanionConfigField[] {
        return [
          {
            type: 'textinput',
            id: 'host',
            label: 'IP Address/ Host',
            width: 12,
            default: '127.0.0.1',
          },
          {
            type: 'dropdown',
            id: 'model',
            label: 'Select ZEN Model',
            choices: [
                { id: 'LV5300A', label: 'LV5300A' },
                { id: 'LV5350', label: 'LV5350' },
                { id: 'LV5600', label: 'LV5600' },
                { id: 'LV5600W', label: 'LV5600W' },
                { id: 'LV7600', label: 'LV7600' },
                { id: 'LV7600W', label: 'LV7600W' },
                { id: 'LV7300', label: 'LV7300' },
            ],
            width: 7,
            default: 'LV5600',
          },
            {
            type: 'number',
            id: 'port',
            label: 'Telnet Port',
            width: 3,
            default: 23,
            min: 1,
            max: 65535,
          },
          {
            type: 'number',
            id: 'sendOnConnectDelayMs',
            label: 'Delay before sending command',
            width: 3,
            default: 500,
            min: 0,
            max: 10000,
          },
        ]
      }
