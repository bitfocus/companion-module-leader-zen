// Company: Leader Electronics of Europe
// License: MIT
// Created by: Ed Smith 
// Date: 13/05/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons. 
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically generated when module has connected 

import {
  InstanceBase,
  InstanceStatus,
  combineRgb,
  TelnetHelper,
  type CompanionActionDefinitions,
  type CompanionFeedbackDefinitions,
  type CompanionPresetDefinitions,
  //type CompanionVariableDefinition,
} from '@companion-module/base'

import type { ModuleConfig } from './config.js'
import { getConfigFields } from './config.js'


// ---------------------------------------
// MAIN INSTANCE
// ---------------------------------------
export class LVPresetModule extends InstanceBase<ModuleConfig> {

      private config!: ModuleConfig
      private socket: TelnetHelper | undefined
      private login = false
      
      // CREATE 60 PREDEFINED USER PRESETS FOR ZEN
      private userPresets = new Array(60).fill(null).map((_, i) => ({id: `${i + 1}`, label: `Preset ${i + 1}`}));
      private lastData = "-1"
      
  // ---------------------------------------
  // INIT
  // ---------------------------------------
      public async init(config: ModuleConfig): Promise<void> {
        this.config = config
        this.updateStatus(InstanceStatus.Connecting)
        this.setActionDefinitions(this.buildActions())
        this.setPresetDefinitions(this.buildPresets())
        this.setFeedbackDefinitions(this.buildFeedbacks())
    // ---------------------------------------
    // Variable Definitions
    // ---------------------------------------
        this.setVariableDefinitions([
          { variableId: 'last_loaded_preset', name: 'Last Loaded Preset' },
          ])
        this.initConnection()
      }

    // ---------------------------------------
    // Config setup
    // ---------------------------------------
      public async configUpdated(config: ModuleConfig): Promise<void> {
        this.config = config
        this.initConnection()
      }
      
      getConfigFields() {
        return getConfigFields()
      }
      
      //Closes the Telnet connection and cleans up all resources.
      public async destroy(): Promise<void> {
        if (this.socket) {
          this.socket.destroy()
          this.socket = undefined
          this.login = false
        }
      }

    // ---------------------------------------
    // Connect to socket and create Telnet connection
    // ---------------------------------------
      private initConnection(): void {
        // Clean up previous socket if any
        if (this.socket) {
          this.socket.destroy()
          this.socket = undefined
        }

        const { host, port } = this.config

        if (!host || !port) {
          this.updateStatus(InstanceStatus.BadConfig, 'Host/port not set')
          return
        }

        this.socket = new TelnetHelper(host, port)
        
        // TELNET STATUS CHANGE
        this.socket.on('status_change', (status, message) => {
          this.updateStatus(status, message)
        })
        
        // TELNET ERROR
        this.socket.on('error', (err) => {
          this.updateStatus(InstanceStatus.UnknownError, err?.message ?? 'Socket error')
          this.login = false
          this.log('error', `Socket error: ${err?.message}`)
        })
        
        // TELNET CONNECT
        this.socket.on('connect', () => {
          this.login = false
          this.updateStatus(InstanceStatus.Connecting, 'Connecting...')
          this.log('info', `Connecting to ${host}:${port}`)
        })
        
        // TELNET BUFFER DATA
        this.socket.on('data', (buffer) => {
          const data = buffer.toString()
          const text = data.replace(/\x1b\[[0-9;]*m/g, '')
          this.log('debug', `Received: ${data}`)
          
          // CHECK PRESET NUMBER RETURNED AFTER SEND TO ASCERTAIN BASIC COMMAND LOAD SUCCESS
          // NOTE: Preset may not have loaded on device. 
          // There is no way to ascertain if the user preset has actually loaded from the API
          if (text.includes(this.lastData[5])) {
            this.log('info', 'Preset ' + this.lastData + ' set')
            this.checkFeedbacks('preset_success')
            this.setVariableValues({ last_loaded_preset: this.lastData })
          }
          
          // LOG IN HANDLING
          if (text.includes('Login incorrect')) {
            this.login = false
            this.updateStatus(InstanceStatus.UnknownError, 'Login incorrect')
            }
          
          if (!this.login) {
              if (text.includes('login:')) {
                this.socket?.send(this.config.username + '\r\n')
                }
              if (text.includes('Password:')) {
                this.socket?.send(this.config.username + '\r\n')
                
                }
              if (text.includes(this.config.username + ':~$')) {
                this.login = true
                this.updateStatus(InstanceStatus.Ok, 'Logged In')
                }
              
          }
        })
        
        // TELNET SOCKET NEGOTIATION
        this.socket.on('iac', (type, info) => {
            if (type == 'DO') {
                this.socket?.send(Buffer.from([255, 252, info]))
            }

            if (type == 'WILL') {
                this.socket?.send(Buffer.from([255, 254, info]))
            }
        })
      }
      
    // ---------------------------------------
    // Send command to ZEN device over telnet
    // ---------------------------------------
      private safeSend(payload: string): void {
        if (!this.socket) {
          this.log('warn', 'Not connected')
          this.updateStatus(InstanceStatus.ConnectionFailure, 'Socket not available')
          this.login = false
          return
        }
        
        this.log('debug', `payload: ${payload}\r`)
        this.lastData = payload
        setTimeout(() => {
            this.socket?.send(payload+'\r\n')
            }, this.config.sendOnConnectDelayMs)
      }


    // ---------------------------------------
    // COMPANION BUTTON BUILD ACTIONS
    // ---------------------------------------
  private buildActions(): CompanionActionDefinitions {
    const choices = this.userPresets
    return {
      // ---- LOAD USER PRESET ON ZEN----
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
            this.safeSend(`RCLL ${presetId}`)
        },
      },
      
    }
  }

    // ---------------------------------------
    // COMPANION BUTTON PRESETS
    // ---------------------------------------
private buildPresets(): CompanionPresetDefinitions {
    const defs: CompanionPresetDefinitions = {}
    // ---- USER PRESETS FOR ZEN----
    for (const p of this.userPresets) {
      defs[`load_${p.id}`] = {
        type: 'button',
        category: 'User Presets',
        name: `Load ${p.label}`,
        style: {
          text: p.label,
          size: '18',
          color: combineRgb(255, 255, 255),
          bgcolor: combineRgb(0, 102, 204),
        },
        steps: [{ down: [{ actionId: 'load_preset', options: { presetId: p.id } }], up: [] }],
        feedbacks: [
            { feedbackId: 'preset_success', 
                options: {presetId: p.id},
                style: { bgcolor: combineRgb(0, 200, 0), color: combineRgb(0, 0, 0)},}],
      }
    }

    return defs
  }

    // ---------------------------------------
    // COMPANION BUTTON FEEDBACKS
    // ---------------------------------------
private buildFeedbacks(): CompanionFeedbackDefinitions {
const choices = this.userPresets
return {
      preset_success: {
        type: 'boolean',
        name: 'Preset Selected',
        description:
          'Turns user preset button green when pressed',
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
          },],
        callback: (fb) =>  this.lastData == 'RCLL ' + String(fb.options.presetId ?? ''), 
      },
    }
  }
  
}
