use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn get_data(app: tauri::AppHandle, key: String) -> Result<Option<String>, String> {
    let store = app.store("water.json").map_err(|e| e.to_string())?;
    let data = store.get(&key).map(|v| v.as_str().unwrap_or("").to_string());
    Ok(data)
}

#[tauri::command]
pub async fn set_data(app: tauri::AppHandle, key: String, value: String) -> Result<(), String> {
    let mut store = app.store("water.json").map_err(|e| e.to_string())?;
    store.set(&key, value);
    store.save().map_err(|e| e.to_string())
}
