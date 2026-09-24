// Company: Leader Electronics of Europe 2026
// License: MIT
// Created by: Ed Smith 
// Date: 07/09/2026
// Load user presets on Leader ZEN waveform monitor using companion/ streamdeck buttons. 
// Requires Telnet to be enabled on Leader ZEN device and to be connected to same network as Companion
// 60 user preset buttons are automatically genereated when module has connected 

import {
    InstanceStatus,
    TelnetHelper,
} from '@companion-module/base'

import type { LVPresetModule } from './main.js'

// ---------------------------------------
// Initialise Telnet connection
// ---------------------------------------

export function initConnection(
    instance: LVPresetModule
): void {
    // Destroy existing socket first
    if (instance.socket) {
        disconnect(instance)
    }

    const { host, port } = instance.config

    if (!host || !port) {
        instance.updateStatus(
            InstanceStatus.BadConfig,
            'Host/port not set'
        )
        return
    }

    instance.socket = new TelnetHelper(host, port)

    // ---------------------------------------
    // SOCKET STATUS
    // ---------------------------------------

    instance.socket.on('status_change', (status, message) => {
        instance.updateStatus(status, message)
    })

    // ---------------------------------------
    // SOCKET ERROR
    // ---------------------------------------

    instance.socket.on('error', (err) => {
        instance.updateStatus(
            InstanceStatus.UnknownError,
            err?.message ?? 'Socket error'
        )

        instance.log(
            'error',
            `Socket error: ${err?.message ?? 'Unknown error'}`
        )
        
        
    })

    // ---------------------------------------
    // SOCKET CONNECT
    // ---------------------------------------

    instance.socket.on('connect', () => {
        instance.login = false

        instance.updateStatus(
            InstanceStatus.Connecting,
            'Connecting...'
        )

        instance.log(
            'info',
            `Connecting to ${host}:${port}`
        )
    })

    // ---------------------------------------
    // SOCKET DATA
    // ---------------------------------------

    instance.socket.on('data', (buffer) => {
        const data = buffer.toString()
        const text = data.replace(
            /\x1b\[[0-9;]*m/g,
            ''
        )

        instance.log('debug', `Received: ${text}`)
        
        if (text.includes('!! ERROR !!')) {
            instance.log('error', text)

            if (instance.presetAckTimer) {
                clearTimeout(instance.presetAckTimer)
                instance.presetAckTimer = undefined
            }
            instance.presetLoadPending = false

            if (instance.presetLoadTimer) {
                clearTimeout(instance.presetLoadTimer)
                instance.presetLoadTimer = undefined
            }

            return
        }

        // ---------------------------------------
        // PRESET LOAD CONFIRMATION
        // ---------------------------------------
        // NOTE: Preset may not have loaded on device. 
        // There is no way to ascertain if the user preset has actually loaded from the API.
        // This checks that the RCLL telnet command has been received for the preset ID 
        // assuming preset has loaded
        
        if (instance.lastPresetId && text.includes('RCLL ' + instance.lastPresetId)) {
            
            if (instance.presetAckTimer) {
                clearTimeout(instance.presetAckTimer)
            }

            instance.presetAckTimer = setTimeout(() => {
                instance.log(
                    'info',
                    `Preset ${instance.lastPresetId} acknowledged`
                )

                instance.checkFeedbacks('preset_success')

                instance.setVariableValues({
                    last_loaded_preset: instance.lastPresetId,
                })

                instance.presetAckTimer = undefined
            }, 200)
            
            
            instance.setVariableValues({
                last_loaded_preset: instance.lastPresetId,
            })
            
            instance.presetLoadPending = false
            
            if (instance.presetLoadTimer) {
                clearTimeout(instance.presetLoadTimer)
                instance.presetLoadTimer = undefined
            }
        }
        

        // ---------------------------------------
        // LOGIN FAILED
        // ---------------------------------------

        if (text.includes('Login incorrect') || text.includes(':/$')) {
            instance.login = false

            instance.updateStatus(
                InstanceStatus.UnknownError,
                'Login incorrect'
            )
            instance.log('error', 'Login incorrect')
            disconnect(instance)
            return
        }
        

        // ---------------------------------------
        // LOGIN HANDLING
        // ---------------------------------------

        if (!instance.login) {
            // Special login case for LV5300A
            if (instance.config.model==="LV5300A") { instance.config.model = "LV5300" }

            if (text.includes('login:')) {
                instance.socket?.send(
                    instance.config.model + '\r\n'
                )
            }

            if (text.includes('Password:')) {
                instance.socket?.send(
                    instance.config.model + '\r\n'
                )
            }

            if (text.includes(
                    `${instance.config.model}:~$`
                )
            ) {
                instance.login = true

                instance.updateStatus(
                    InstanceStatus.Ok,
                    'Logged In'
                )
                instance.log('info', 'Login successful')
            } 
        }
    })

    // ---------------------------------------
    // TELNET NEGOTIATION
    // ---------------------------------------

    instance.socket.on('iac', (type, info) => {
        if (type === 'DO') {
            instance.socket?.send(
                Buffer.from([255, 252, info])
            )
        }

        if (type === 'WILL') {
            instance.socket?.send(
                Buffer.from([255, 254, info])
            )
        }
    })
}

// ---------------------------------------
// Send command to the ZEN device
// ---------------------------------------
export function safeSend(
    instance: LVPresetModule,
    payload: string
): void {

    if (!instance.socket) {
        instance.log('warn', 'Not connected')

        instance.updateStatus(
            InstanceStatus.ConnectionFailure,
            'Socket not available'
        )

        instance.login = false

        return
    }

    instance.log(
        'debug',
        `payload: ${payload}\r`
    )

    // Prevent multiple preset load commands while
    // waiting for acknowledgement from the device
    if (payload.startsWith('RCLL ')) {
        const presetId = payload.substring(5).trim()

        if (instance.presetLoadPending && presetId === instance.lastPresetId) {
            instance.log(
                'debug',
                `Ignoring preset load ${presetId}, previous load still pending`
            )
            return
        }

        instance.lastPresetId = presetId
        instance.presetLoadPending = true
        
        if (instance.presetLoadTimer) {
            clearTimeout(instance.presetLoadTimer)
        }

        instance.presetLoadTimer = setTimeout(() => {
            instance.log(
                'warn',
                `Preset ${presetId} acknowledgement timeout`
            )

            instance.presetLoadPending = false
            instance.presetLoadTimer = undefined
        }, 5000) // 5 seconds

    }

    if (instance.clearSendTimer) {
        clearTimeout(instance.clearSendTimer)
    }

    instance.clearSendTimer = setTimeout(() => {
        instance.socket?.send(payload + '\r\n')
    }, instance.config.sendOnConnectDelayMs)


}

/**
 * Cleanly close the telnet connection
 */
export function disconnect(
    instance: LVPresetModule
): void {

    if (instance.clearSendTimer) {
        clearTimeout(instance.clearSendTimer)
    }
    
    if (instance.presetLoadTimer) {
        clearTimeout(instance.presetLoadTimer)
        instance.presetLoadTimer = undefined
    }
    
    if (instance.presetAckTimer) {
        clearTimeout(instance.presetAckTimer)
    }
    
    if (instance.socket) {
        instance.socket.destroy()
        instance.socket = undefined
    }

    instance.login = false
    instance.presetLoadPending = false
    
    instance.log('info', 'Telnet connection closed')
}