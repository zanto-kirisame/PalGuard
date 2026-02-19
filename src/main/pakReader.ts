import fs from 'fs'

// UE Pak Magic Number: 0x5A6F12E1 (in little endian: E1 12 6F 5A)
const PAK_MAGIC = 0x5A6F12E1

export interface PakInfo {
    version: number
    indexOffset: bigint
    indexSize: bigint
    mountPoint: string
}

/**
 * Lightweight Pak Reader for Unreal Engine 4/5
 * Aims for minimal memory consumption by reading only necessary parts.
 */
export class PakReader {
    private filePath: string
    private fd: number | null = null

    constructor(filePath: string) {
        this.filePath = filePath
    }

    private open(): number {
        if (this.fd === null) {
            this.fd = fs.openSync(this.filePath, 'r')
        }
        return this.fd
    }

    close() {
        if (this.fd !== null) {
            fs.closeSync(this.fd)
            this.fd = null
        }
    }

    /**
     * Reads the Pak Footer to get index location.
     * Footer size can vary, but we look for the magic mapping to common versions.
     */
    getPakInfo(): PakInfo | null {
        const fd = this.open()
        const stats = fs.statSync(this.filePath)
        const fileSize = stats.size

        // Read the last 221 bytes (standard version 11 footer size)
        // If it's older/newer, it might be different, but Palworld is UE 5.1 (likely v11)
        const footerBufferSize = Math.min(256, fileSize)
        const buffer = Buffer.alloc(footerBufferSize)
        fs.readSync(fd, buffer, 0, footerBufferSize, fileSize - footerBufferSize)

        // Magic number is the last 4 bytes of FPakInfo
        const magicOffset = footerBufferSize - 4
        const magic = buffer.readUInt32LE(magicOffset)

        if (magic !== PAK_MAGIC) {
            // Check other common footer sizes/offsets if needed
            return null
        }

        // FPakInfo structure (v11):
        // [EncryptionKeyGuid (16)] [Encrypted (1)] [Version (4)] [IndexOffset (8)] [IndexSize (8)] [IndexHash (20)] [Magic (4)]
        // Offsets from magic:
        // Version: magic - 37
        // IndexOffset: magic - 33
        // IndexSize: magic - 25

        const version = buffer.readInt32LE(magicOffset - 33)
        const indexOffset = buffer.readBigInt64LE(magicOffset - 29)
        const indexSize = buffer.readBigInt64LE(magicOffset - 21)

        // Read mount point (usually right at the index start)
        const mountPointBuffer = Buffer.alloc(128)
        fs.readSync(fd, mountPointBuffer, 0, 128, Number(indexOffset))

        // Mount point is a string: [Length (4)] [String (Length)]
        const mountLen = mountPointBuffer.readInt32LE(0)
        let mountPoint = ""
        if (mountLen > 0 && mountLen < 128) {
            mountPoint = mountPointBuffer.toString('utf-8', 4, 4 + mountLen).replace(/\0/g, '')
        }

        return { version, indexOffset, indexSize, mountPoint }
    }

    /**
     * Efficiently extracts asset paths by scanning the index buffer.
     * We don't fully parse every FPakEntry to save time, just look for path-like strings in the index.
     */
    getAssetPaths(): string[] {
        const info = this.getPakInfo()
        if (!info) return []

        const fd = this.open()
        // The index contains FPakEntry structures. 
        // Large paks have large indices. We read it in chunks if very large, 
        // but typically it's a few MBs at most per mod.
        const indexBuffer = Buffer.alloc(Number(info.indexSize))
        fs.readSync(fd, indexBuffer, 0, Number(info.indexSize), Number(info.indexOffset))

        const assets: string[] = []
        const indexContent = indexBuffer.toString('latin1')

        // Match /Pal/Content/... asset paths.
        // We use a regex on the binary-as-string for speed, while avoiding loading the whole huge PAK.
        const matches = indexContent.match(/\/Pal\/Content\/[A-Za-z0-9_./-]+\.(?:uasset|umap|uexp)/g)
        if (matches) {
            for (const match of matches) {
                assets.push(match.toLowerCase())
            }
        }

        return [...new Set(assets)]
    }
}
