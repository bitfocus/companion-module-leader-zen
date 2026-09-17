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
        instance.socket.destroy()
        instance.socket = undefined
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

        instance.login = false

        instance.log(
            'error',
            `Socket error: ${err?.message ?? 'Unknown error'}`
        )
        
        // Stop and destroy socket something bad has happened
        if (instance.socket) {
            instance.socket.destroy()
            instance.socket = undefined
        }
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

        // ---------------------------------------
        // PRESET LOAD CONFIRMATION
        // ---------------------------------------
        // NOTE: Preset may not have loaded on device. 
        // There is no way to ascertain if the user preset has actually loaded from the API
        // this cheks that the RCLL telnet command has been received for the preset ID 
        // assuming preset has loaded
        
        if (instance.lastPresetId && text.includes('RCLL ' + instance.lastPresetId)) {
            instance.log(
                'info',
                `Preset ${instance.lastPresetId} acknowledged`
            )

            instance.checkFeedbacks('preset_success')

            instance.setVariableValues({
                last_loaded_preset: instance.lastPresetId,
            })
        }

        // ---------------------------------------
        // LOGIN FAILED
        // ---------------------------------------

        if (text.includes('Login incorrect')) {
            instance.login = false

            instance.updateStatus(
                InstanceStatus.UnknownError,
                'Login incorrect'
            )
            instance.log('error', 'Login incorrect')
            return
        }

        // ---------------------------------------
        // LOGIN HANDLING
        // ---------------------------------------
        // Username and Password are
        if (!instance.login) {
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

            if (
                text.includes(
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

    instance.lastData = payload

    // only load preset once. If button pressed multiple times ignore sending command again
    if (instance.lastData != 'RCLL ' + instance.lastPresetId){
        setTimeout(() => {
            instance.socket?.send(payload + '\r\n')
        }, instance.config.sendOnConnectDelayMs)
    }
    
    // Capture preset number for feedback tracking
    if (payload.startsWith('RCLL ')) {
        instance.lastPresetId = payload.substring(5).trim()
    }

}

/**
 * Cleanly close the telnet connection
 */
export function disconnect(
    instance: LVPresetModule
): void {
    if (instance.socket) {
        instance.socket.destroy()
        instance.socket = undefined
    }

    instance.login = false
    instance.log('info', 'Telnet connection closed')
}