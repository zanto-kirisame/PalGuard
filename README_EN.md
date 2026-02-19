# PalGuard

A lightweight, high-performance tool for managing Palworld patch mods (.pak) and UE4SS scripts.

## Key Features

- **Toggle Mods**: Enable or disable mods with a single click.
- **Priority (Load Order) Management**: Adjust mod priority using intuitive Up/Down buttons to handle asset conflicts.
- **Lightweight Conflict Detection**: Directly parses `.pak` file indexes to identify specific asset conflicts (e.g., two mods modifying the same Pal) without external tools.
- **Conflict Visualization**: Easily identify which mods are overwriting specific assets and see the "Winner" mod based on load order.
- **External Tool Update Monitoring**: Automatically checks for the latest versions of Palworld, UE4SS, and Pal Schema. Reminds you of the importance of backups.
- **UI Stabilization**: Fixed layout jitters during tab switching for a smoother experience.
- **Multi-language Support**: Supports both Japanese and English.

## Installation

1. Download `PalGuard_v1.2.0.zip` from the [Releases] page.
2. Extract to your preferred location.
3. Run `PalGuard.exe`.
4. Go to Settings and select your Palworld installation folder.
   - Example: `C:\Program Files (x86)\Steam\steamapps\common\Palworld`

## Usage

### Mod Management
- Use the toggle switch to enable/disable mods.
- Move mods up or down in the list to determine load order. Mods lower in the list (higher priority) will overwrite those above them when they modify the same assets.
- **Conflict Check**: PalGuard automatically scans the contents of `.pak` files. If multiple mods modify the same internal file (e.g., `Character/Pals/BP_PalStatus.uasset`), a warning will be displayed.

### Log Analysis
- If the game crashes or mods aren't working, check the "Log Analysis" tab.
- It identifies known error patterns and suggests actionable steps.

## Important: Disclaimer and Backup

> [!WARNING]
> **Use at your own risk.**
> While PalGuard does not delete your game files, it performs filename manipulation to manage mods.
> We strongly recommend backing up the following folder before using any mod manager:
> `.../Pal/Content/Paks`

## License
MIT License

## Author
Zanto
