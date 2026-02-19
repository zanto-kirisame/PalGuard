export const translations = {
    ja: {
        sidebar: {
            modList: 'MODリスト',
            logs: 'ログ解析',
            settings: '設定'
        },
        modList: {
            title: 'MODリスト',
            type: '種類',
            status: '状態',
            enabled: '有効',
            disabled: '無効',
            conflicts: '競合',
            winner: '優先(Winner)',
            noMods: 'MODが見つかりません。',
            resetPriority: '⚠️ 順位リセット',
            refresh: '🔄 更新',
            resetConfirm: 'すべての優先順位設定をリセットし、ファイル名を初期状態に戻しますか？',
            scanning: 'スキャン中...',
            conflictDetected: '競合発生',
            conflictWinner: '優先されるMOD'
        },
        logs: {
            title: 'ログ解析',
            summary: 'サマリー',
            palTrace: 'Pal-Trace.log',
            ue4ssLog: 'UE4SS.log',
            issues: '⚠️ 検出された問題と対策',
            noIssues: '現在、既知のエラーパターンは検出されていません。',
            candidates: '🔍 調査候補 (最近変更された有効MOD)',
            noEnabledMods: '有効なMODはありません。',
            unknownDate: '不明',
            loading: '読み込み中...',
            noErrors: 'エラーは見つかりませんでした。',
            causes: {
                oom: 'メモリ不足（MODの入れすぎ、またはPCスペック不足）',
                access: 'プロセス干渉（アンチウィルスソフトや他のツールとの競合の可能性）',
                checksum: 'MODファイルの破損（再ダウンロード推奨）',
                loadFail: 'MODの読み込み失敗（依存MODが不足している可能性があります）'
            }
        },
        settings: {
            title: '設定',
            installPath: 'パルワールド インストールパス',
            selectPath: 'パスを選択',
            language: '言語設定 (Language)',
            saveStatus: '設定を保存しました',
            placeholder: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Palworld'
        },
        updates: {
            title: 'アップデート情報',
            newVersion: '新バージョンが利用可能です',
            palworld: 'Palworld',
            ue4ss: 'UE4SS',
            palschema: 'Pal Schema',
            backupWarning: '※更新直後はMODが壊れる可能性があるので、バックアップを忘れずに',
            latest: '最新'
        }
    },

    en: {
        sidebar: {
            modList: 'Mod List',
            logs: 'Log Analysis',
            settings: 'Settings'
        },
        modList: {
            title: 'Mod List',
            type: 'Type',
            status: 'Status',
            enabled: 'Enabled',
            disabled: 'Disabled',
            conflicts: 'Conflicts',
            winner: 'Priority (Winner)',
            noMods: 'No mods found.',
            resetPriority: '⚠️ Reset Order',
            refresh: '🔄 Refresh',
            resetConfirm: 'Reset all priority settings and restore filenames to initial state?',
            scanning: 'Scanning...',
            conflictDetected: 'Conflict Detected',
            conflictWinner: 'Priority Mod'
        },
        logs: {
            title: 'Log Analysis',
            summary: 'Summary',
            palTrace: 'Pal-Trace.log',
            ue4ssLog: 'UE4SS.log',
            issues: '⚠️ Detected Issues & Actions',
            noIssues: 'No known error patterns detected.',
            candidates: '🔍 Investigation Candidates (Recently modified enabled mods)',
            noEnabledMods: 'No enabled mods.',
            unknownDate: 'Unknown',
            loading: 'Loading...',
            noErrors: 'No errors found.',
            causes: {
                oom: 'Out of memory (Too many mods or insufficient PC specs)',
                access: 'Process interference (Conflict with antivirus or other tools)',
                checksum: 'Corrupted mod file (Re-download recommended)',
                loadFail: 'Failed to load mod (Missing dependencies)'
            }
        },
        settings: {
            title: 'Settings',
            installPath: 'Palworld Installation Path',
            selectPath: 'Select Path',
            language: 'Language Settings',
            saveStatus: 'Settings saved',
            placeholder: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Palworld'
        },
        updates: {
            title: 'Update Info',
            newVersion: 'New version available',
            palworld: 'Palworld',
            ue4ss: 'UE4SS',
            palschema: 'Pal Schema',
            backupWarning: '* Mods may break after updates. Don\'t forget to backup.',
            latest: 'Latest'
        }
    }
};

export type Language = 'ja' | 'en';
export type TranslationType = typeof translations.ja;
