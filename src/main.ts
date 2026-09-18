// Company: Leader Electronics of Europe 2026
// License: MIT
// Created by: Ed Smith 
// Date: 07/09/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons. 
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically genereated when module has connected 

import {
  InstanceBase,
  InstanceStatus,
  TelnetHelper,
} from '@companion-module/base'

import type { ModuleConfig } from './config.js'
import { getConfigFields } from './config.js'
import { USER_PRESETS } from './constants.js'
import { getActions } from './actions.js'
import { getFeedbacks } from './feedbacks.js'
import { getPresets } from './presets.js'
import { initVariables } from './variables.js'
import { initConnection, disconnect } from './telnet.js'

// ---------------------------------------
// MAIN INSTANCE
// ---------------------------------------
export class LVPresetModule extends InstanceBase<ModuleConfig> {

      public config!: ModuleConfig
      public socket: TelnetHelper | undefined
      public login = false
      // public lastData = "-1"
      public lastPresetId = ''
      public clearSendTimer: NodeJS.Timeout | undefined
      public presetLoadTimer: NodeJS.Timeout | undefined
      public presetLoadPending = false
      public presetAckTimer: NodeJS.Timeout | undefined
      
      // CREATE 60 PREDEFINED USER PRESETS FOR ZEN
      
      public readonly userPresets = USER_PRESETS
      
      
  // ---------------------------------------
  // INIT
  // ---------------------------------------
      public async init(config: ModuleConfig): Promise<void> {
        this.config = config
        this.updateStatus(InstanceStatus.Connecting)
        this.setActionDefinitions(getActions(this))
        this.setPresetDefinitions(getPresets(this))
        this.setFeedbackDefinitions(getFeedbacks(this))
    // ---------------------------------------
    // Variable Definitions
    // ---------------------------------------
        initVariables(this)
        initConnection(this)
      }

    // ---------------------------------------
    // Config setup
    // ---------------------------------------
     public async configUpdated(config: ModuleConfig): Promise<void> {
        this.config = config
        initConnection(this)
      }
      
      getConfigFields() {
        return getConfigFields()
      }
      
      //Closes the Telnet connection and cleans up all resources.
      public async destroy(): Promise<void> {
        disconnect(this)
      }

      
}
