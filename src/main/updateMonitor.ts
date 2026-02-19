import { net } from 'electron'
import { store } from './store'

interface UpdateInfo {
    latest: string;
    url?: string;
    date?: string;
}

interface UpdateCache {
    timestamp: number;
    data: Record<string, UpdateInfo>;
}

export async function checkUpdates() {
    const cache = store.get('updateCache') as UpdateCache | undefined;
    const now = Date.now();
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;

    if (cache && (now - cache.timestamp) < TWELVE_HOURS) {
        return cache.data;
    }

    // Parallel fetch
    const [palworld, ue4ss, palschema] = await Promise.all([
        getPalworldUpdate(),
        getGithubUpdate('UE4SS-RE/RE-UE4SS'),
        getGithubUpdate('Okaetsu/PalSchema')
    ]);

    const results = { palworld, ue4ss, palschema };

    store.set('updateCache', {
        timestamp: now,
        data: results
    });

    return results;
}

async function getGithubUpdate(repo: string): Promise<UpdateInfo> {
    try {
        const response = await fetchJson(`https://api.github.com/repos/${repo}/releases/latest`);
        return {
            latest: response.tag_name || 'unknown',
            url: response.html_url,
            date: response.published_at ? new Date(response.published_at).toLocaleDateString('ja-JP') : undefined
        };
    } catch (e) {
        console.error(`Failed to fetch updates for ${repo}`, e);
        return { latest: 'unknown' };
    }
}

async function getPalworldUpdate(): Promise<UpdateInfo> {
    try {
        const response = await fetchJson(`https://api.steamcmd.net/v1/info/2488200`);
        const publicBranch = response.data['2488200']?.depots?.branches?.public;
        const buildid = publicBranch?.buildid;
        const timeupdated = publicBranch?.timeupdated;

        return {
            latest: buildid ? `Build ${buildid}` : 'unknown',
            url: 'https://store.steampowered.com/news/app/2488200',
            date: timeupdated ? new Date(Number(timeupdated) * 1000).toLocaleDateString('ja-JP') : undefined
        };
    } catch (e) {
        console.error(`Failed to fetch Palworld updates`, e);
        return { latest: 'unknown' };
    }
}

async function fetchJson(url: string) {
    return new Promise<any>((resolve, reject) => {
        const request = net.request({
            url,
            headers: {
                'User-Agent': 'PalGuard-App'
            }
        });
        request.on('response', (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to fetch ${url}: ${response.statusCode}`));
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        request.on('error', (error) => {
            reject(error);
        });
        request.end();
    });
}
