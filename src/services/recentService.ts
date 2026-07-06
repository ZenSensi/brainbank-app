import AsyncStorage from "@react-native-async-storage/async-storage";
import { ContentItem } from "../types";

const RECENTLY_VIEWED_KEY = "recently_viewed_items";

export async function addRecentlyViewed(item: ContentItem): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    let items: ContentItem[] = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists to move it to the top
    items = items.filter((i) => i.id !== item.id);
    
    // Insert at the beginning
    items.unshift(item);
    
    // Limit to 10 items
    if (items.length > 10) {
      items = items.slice(0, 10);
    }
    
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving recently viewed:", error);
  }
}

export async function getRecentlyViewed(): Promise<ContentItem[]> {
  try {
    const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error fetching recently viewed:", error);
    return [];
  }
}

export async function clearRecentlyViewed(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error("Error clearing recently viewed:", error);
  }
}

export async function removeRecentlyViewed(id: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!stored) return;
    let items: ContentItem[] = JSON.parse(stored);
    items = items.filter((i) => i.id !== id);
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error removing recently viewed:", error);
  }
}

