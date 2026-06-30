import json

for file_path in ['/Users/marcossandovalruiz/Documents/quhealthy/messages/en.json', '/Users/marcossandovalruiz/Documents/quhealthy/messages/es.json']:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # We want to pull out SettingsPreferences, SettingsConnections, SettingsSecurity, etc. 
    # out of SettingsSubscription.
    
    sub = data.get('SettingsSubscription', {})
    
    keys_to_move = [
        'SettingsPreferences', 'SettingsConnections', 'SettingsSecurity', 
        'Settings2FA', 'SettingsPassword', 'SettingsAlerts', 
        'SettingsDevices', 'SettingsActivity'
    ]
    
    for k in keys_to_move:
        if k in sub:
            # Move to root
            data[k] = sub.pop(k)
            
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')
