## Leader Zen Preset loader

- Loads user presets on a Leader Zen waveform monitor range (LV5600, LV7600 etc).
- Telnet protocol needs to be enabled on your Zen device and connected to the network with static IP address.
- User needs to save presets on the Zen device into one of the available sixty preset slots before they can be recalled.
- 60 user preset buttons (1-60) are automatically generated when module has connected, ready to be added to your button panel
- Button feedback when preset has been selected.

NOTE: Button feedback only indicates that the button has been pressed and the command sent to the unit. It does not actually confirm if the preset has been loaded - there is no API call to check.

NOTE: Presets may take a while to be recalled on the Zen device once actioned from the button panel. Preset names created on the Zen device will not appear in companion, but the button name can be manually changed in Companion if required.

Compatible with:

- LV5300A (LV5300)
- LV5350
- LV5600
- LV5600W
- LV7300
- LV7600
- LV7600W
