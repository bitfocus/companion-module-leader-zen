// This module is BETA and not to be distributed outside of Leader.
// Created by: Ed Smith ed.smith@leadereurope.com
// Date: 26/03/2026

import { runEntrypoint } from '@companion-module/base'
import { LVPresetModule } from './main.js'
import { UpgradeScripts } from './upgrades.js'

runEntrypoint(LVPresetModule, UpgradeScripts)