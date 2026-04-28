use serde::{Deserialize, Serialize};
use tauri::State;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct WaterData {
    pub count: u32,
    pub goal: u32,
    pub history: Vec<DrinkRecord>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DrinkRecord {
    pub id: String,
    pub timestamp: String,
    pub amount: u32,
}

#[tauri::command]
pub async fn get_data(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let store = app.store("water.json").map_err(|e| e.to_string())?;
    let data = store.get("data").map(|v| v.as_str().unwrap_or("").to_string());
    Ok(data)
}

#[tauri::command]
pub async fn set_data(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let mut store = app.store("water.json").map_err(|e| e.to_string())?;
    store.set("data", data);
    store.save().map_err(|e| e.to_string())
}
