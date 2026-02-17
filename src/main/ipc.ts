import { ipcMain, dialog } from 'electron'
import { store } from './store'
import fs from 'fs'
import path from 'path'

export function registerIpcHandlers(): void {
    ipcMain.handle('select-folder', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory']
        })
        if (canceled) {
            return null
        }
        const selectedPath = filePaths[0]
        store.set('palworldInstallPath', selectedPath)
        return selectedPath
    })

    ipcMain.handle('get-settings', () => {
        return {
            palworldInstallPath: store.get('palworldInstallPath')
        }
    })

    ipcMain.handle('scan-mods', async (_, installPath: string) => {
        if (!installPath) return []

        const paksPath = path.join(installPath, 'Pal', 'Content', 'Paks')
        const modsPath = path.join(installPath, 'Pal', 'Binaries', 'Win64', 'Mods')

        let mods: any[] = []

        // Recursive function to scan Paks
        const scanDir = (dir: string, rootDir: string) => {
            if (!fs.existsSync(dir)) return

            const files = fs.readdirSync(dir, { withFileTypes: true })
            files.forEach(dirent => {
                const fullPath = path.join(dir, dirent.name)
                if (dirent.isDirectory()) {
                    scanDir(fullPath, rootDir)
                } else {
                    if (dirent.name.endsWith('.pak') || dirent.name.endsWith('.pak.disabled')) {
                        const stats = fs.statSync(fullPath)
                        const relativePath = path.relative(rootDir, fullPath)
                        mods.push({
                            name: dirent.name,
                            path: fullPath,
                            relativePath: relativePath,
                            isEnabled: dirent.name.endsWith('.pak'),
                            type: 'pak',
                            lastModified: stats.mtimeMs
                        })
                    }
                }
            })
        }

        scanDir(paksPath, paksPath)

        if (fs.existsSync(modsPath)) {
            const subdirs = fs.readdirSync(modsPath, { withFileTypes: true })
            const modsTxtPath = path.join(modsPath, 'mods.txt');
            let modsConfig: Record<string, boolean> = {};
            if (fs.existsSync(modsTxtPath)) {
                try {
                    const content = fs.readFileSync(modsTxtPath, 'utf-8');
                    content.split(/\r?\n/).forEach(line => {
                        const match = line.match(/^\s*([^:\s]+)\s*:\s*([01])\s*$/);
                        if (match) {
                            modsConfig[match[1]] = match[2] === '1';
                        }
                    });
                } catch (e) {
                    console.error('Failed to read mods.txt', e);
                }
            }

            subdirs.forEach(dirent => {
                if (dirent.isDirectory()) {
                    const modName = dirent.name;
                    const modDir = path.join(modsPath, modName)
                    const stats = fs.statSync(modDir)

                    let isEnabled = true;
                    if (modName in modsConfig) {
                        isEnabled = modsConfig[modName];
                    }

                    mods.push({
                        name: modName,
                        path: modDir,
                        relativePath: modName,
                        isEnabled: isEnabled,
                        type: 'script',
                        lastModified: stats.mtimeMs
                    })
                }
            })
        }

        return mods
    })

    ipcMain.handle('read-logs', async (_, installPath: string) => {
        const palworldLogsDir = path.join(installPath, 'Pal', 'Saved', 'Logs')
        const ue4ssLogPath = path.join(installPath, 'Pal', 'Binaries', 'Win64', 'UE4SS.log')

        const res = { pal: [] as string[], ue4ss: [] as string[] }

        if (fs.existsSync(palworldLogsDir)) {
            const files = fs.readdirSync(palworldLogsDir).filter(f => f.startsWith('Pal-Trace')).sort().reverse()
            if (files.length > 0) {
                const latestLog = path.join(palworldLogsDir, files[0])
                try {
                    // Performance: only read last 50KB for efficiency
                    const stats = fs.statSync(latestLog)
                    const size = stats.size
                    const readSize = Math.min(size, 50 * 1024)
                    const buffer = Buffer.alloc(readSize)
                    const fd = fs.openSync(latestLog, 'r')
                    fs.readSync(fd, buffer, 0, readSize, size - readSize)
                    fs.closeSync(fd)
                    res.pal = buffer.toString('utf-8').split(/\r?\n/).slice(-1000)
                } catch (e) { console.error(e) }
            }
        }

        if (fs.existsSync(ue4ssLogPath)) {
            try {
                const stats = fs.statSync(ue4ssLogPath)
                const size = stats.size
                const readSize = Math.min(size, 50 * 1024)
                const buffer = Buffer.alloc(readSize)
                const fd = fs.openSync(ue4ssLogPath, 'r')
                fs.readSync(fd, buffer, 0, readSize, size - readSize)
                fs.closeSync(fd)
                res.ue4ss = buffer.toString('utf-8').split(/\r?\n/).slice(-1000)
            } catch (e) { console.error(e) }
        }

        return res
    })

    ipcMain.handle('reset-load-order', async (_, modPaths: string[]) => {
        for (const oldPath of modPaths) {
            if (!fs.existsSync(oldPath)) continue;
            const dir = path.dirname(oldPath);
            const filename = path.basename(oldPath);
            const cleanNameMatch = filename.match(/^(?:z_\d{3}_)?(.+)$/);
            if (!cleanNameMatch) continue;
            const cleanName = cleanNameMatch[1];
            const newPath = path.join(dir, cleanName);
            if (oldPath !== newPath) {
                try { fs.renameSync(oldPath, newPath); } catch (e) { console.error(e); }
            }
        }
        return true;
    })

    // minimal buffer reader for PAK
    const readPakIndex = (filePath: string): string[] => {
        try {
            // Check file size first to avoid memory issues with huge PAKs
            const stats = fs.statSync(filePath);
            if (stats.size > 1024 * 1024 * 1024) { // 1GB limit
                console.log(`Skipping large PAK file: ${filePath} (${(stats.size / 1024 / 1024 / 1024).toFixed(2)} GB)`);
                return [];
            }

            const content = fs.readFileSync(filePath, { encoding: 'latin1' }); // Binary string
            // Improved regex: look for /Pal/Content/... assets with extension
            // Also enforce minimum length and common asset paths to reduce noise
            const matches = content.match(/\/Pal\/Content\/[A-Za-z0-9_./-]+\.(?:uasset|umap|uexp)/g);
            return matches ? [...new Set(matches.map(m => m.toLowerCase()))] : [];

        } catch (e) {
            console.error(`Failed to read PAK ${filePath}`, e);
            return [];
        }
    };

    ipcMain.handle('scan-conflicts', async (_, mods: any[]) => {
        const conflictMap = new Map<string, string[]>();

        for (const mod of mods) {
            if (mod.type === 'pak' && mod.isEnabled) {
                const files = readPakIndex(mod.path);
                for (const file of files) {
                    if (!conflictMap.has(file)) {
                        conflictMap.set(file, []);
                    }
                    conflictMap.get(file)?.push(mod.name);
                }
            }
        }

        const conflicts: any[] = [];
        conflictMap.forEach((modNames, assetPath) => {
            if (modNames.length > 1) {
                conflicts.push({
                    asset: assetPath,
                    mods: modNames
                })
            }
        });

        return conflicts;
    })

    ipcMain.handle('toggle-mod', async (_, modPath: string, isEnabled: boolean) => {
        // ... (existing toggle logic)
        // Check if it's a PAK file
        if (modPath.endsWith('.pak') || modPath.endsWith('.pak.disabled')) {
            if (!fs.existsSync(modPath)) {
                // Try the other state
                const otherPath = isEnabled ? modPath + '.disabled' : modPath.replace('.disabled', '')
                if (fs.existsSync(otherPath)) {
                    modPath = otherPath
                } else {
                    return false
                }
            }

            if (isEnabled) {
                // Target state is Enabled
                if (modPath.endsWith('.disabled')) {
                    const newPath = modPath.replace('.disabled', '')
                    fs.renameSync(modPath, newPath)
                }
            } else {
                // Target state is Disabled
                if (!modPath.endsWith('.disabled')) {
                    const newPath = modPath + '.disabled'
                    fs.renameSync(modPath, newPath)
                }
            }
            return true;
        }

        // Assume it's a Script Mod (directory)
        // Logic: Update mods.txt in the parent folder of the mod folder
        const parentDir = path.dirname(modPath);
        const modsTxtPath = path.join(parentDir, 'mods.txt');
        const modName = path.basename(modPath);

        const updateModsTxt = (name: string, enable: boolean) => {
            if (fs.existsSync(modsTxtPath)) {
                try {
                    let content = fs.readFileSync(modsTxtPath, 'utf-8');
                    const lines = content.split(/\r?\n/);
                    let found = false;
                    const newLines = lines.map(line => {
                        const match = line.match(new RegExp(`^\\s*${name}\\s*:\\s*([01])\\s*$`, 'i'));
                        if (match) {
                            found = true;
                            return `${name} : ${enable ? '1' : '0'}`;
                        }
                        return line;
                    });

                    if (!found) {
                        newLines.push(`${name} : ${enable ? '1' : '0'}`);
                    }

                    fs.writeFileSync(modsTxtPath, newLines.join('\n'), 'utf-8');
                    return true;
                } catch (e) {
                    console.error('Failed to update mods.txt', e);
                    return false;
                }
            } else {
                // Create mods.txt if it doesn't exist
                try {
                    fs.writeFileSync(modsTxtPath, `${name} : ${enable ? '1' : '0'}\n`, 'utf-8');
                    return true;
                } catch (e) {
                    console.error('Failed to create mods.txt', e);
                    return false;
                }
            }
        }

        return updateModsTxt(modName, isEnabled);
    })

    ipcMain.handle('set-load-order', async (_, modPaths: string[]) => {
        for (let i = 0; i < modPaths.length; i++) {
            const oldPath = modPaths[i];
            // Only process enabled PAK files
            if (!fs.existsSync(oldPath) || !oldPath.endsWith('.pak')) continue;

            const dir = path.dirname(oldPath);
            const filename = path.basename(oldPath);

            // Regex to match existing z_XXX_ prefix
            // We strip it to get the "Clean Name"
            const cleanNameMatch = filename.match(/^(?:z_\d{3}_)?(.+)$/);
            if (!cleanNameMatch) continue;

            const cleanName = cleanNameMatch[1];

            // New Prefix: z_{index}_
            // Index is 0-based.
            const prefix = `z_${i.toString().padStart(3, '0')}_`;
            const newName = prefix + cleanName;
            const newPath = path.join(dir, newName);

            if (oldPath !== newPath) {
                try {
                    // Check if target exists (rare edge case of swapping names)
                    // If A -> B and B exists, we might need a temp name.
                    // But typically we are just reordering.
                    // For safety, rename to temp first if collision? 
                    // Let's assume sequential rename is mostly safe if we iterate carefully.
                    // Actually, if we rename 001->002 and 002 exists (moving down), we clobber.
                    // Better strategy: Rename ALL to temporary names first, then rename back to final order?
                    // OR: just do it and hope for the best? No.
                    // Robust strategy: First pass -> Rename all to `temp_GUID_original`. Second pass -> Rename `temp` to final.

                    // Let's do the robust two-pass rename to avoid collisions.
                } catch (e) {
                    console.error('Rename failed', e);
                }
            }
        }

        // Two-pass approach
        const finalMap = new Map<string, string>(); // TempPath -> FinalPath

        // Pass 1: Rename to temp
        for (let i = 0; i < modPaths.length; i++) {
            const oldPath = modPaths[i];
            if (!fs.existsSync(oldPath) || !oldPath.endsWith('.pak')) continue;

            const dir = path.dirname(oldPath);
            const filename = path.basename(oldPath);
            const cleanNameMatch = filename.match(/^(?:z_\d{3}_)?(.+)$/);
            if (!cleanNameMatch) continue;
            const cleanName = cleanNameMatch[1];

            const tempName = `__temp_${Date.now()}_${i}_${cleanName}`;
            const tempPath = path.join(dir, tempName);

            try {
                fs.renameSync(oldPath, tempPath);

                // Calculate final path
                const prefix = `z_${i.toString().padStart(3, '0')}_`;
                const finalName = prefix + cleanName;
                const finalPath = path.join(dir, finalName);

                finalMap.set(tempPath, finalPath);
            } catch (e) {
                console.error('Temp rename failed', e);
            }
        }

        // Pass 2: Rename temp to final
        for (const [tempPath, finalPath] of finalMap.entries()) {
            try {
                fs.renameSync(tempPath, finalPath);
            } catch (e) {
                console.error('Final rename failed', e);
            }
        }

        return true;
    })
}
