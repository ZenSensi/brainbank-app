import AsyncStorage from "@react-native-async-storage/async-storage";
import { ContentItem } from "../types";

const SAVED_ITEMS_KEY = "saved_items_list";

export async function toggleSaveItem(item: any): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_ITEMS_KEY);
    let items: any[] = stored ? JSON.parse(stored) : [];
    
    const exists = items.some((i) => i.id === item.id);
    if (exists) {
      items = items.filter((i) => i.id !== item.id);
    } else {
      items.push(item);
    }
    
    await AsyncStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(items));
    return !exists;
  } catch (error) {
    console.error("Error toggling save:", error);
    return false;
  }
}

export async function isItemSaved(id: string): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_ITEMS_KEY);
    const items: any[] = stored ? JSON.parse(stored) : [];
    return items.some((i) => i.id === id);
  } catch (error) {
    console.error("Error checking saved state:", error);
    return false;
  }
}

export async function getSavedItems(): Promise<any[]> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_ITEMS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error fetching saved items:", error);
    return [];
  }
}
