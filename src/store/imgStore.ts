import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDownloadURL, getStorage, listAll, ref } from 'firebase/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface FirebaseImageData {
    name: string;
    url: string;
    path: string;
    folder: 'badges' | 'threads' | 'users';
}

interface ImagesState {
    images: FirebaseImageData[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;
    loadImages: (forceRefresh?: boolean) => Promise<void>;
    refreshImages: () => Promise<void>; // Add explicit refresh method
    getImageByName: (name: string, folder?: 'badges' | 'threads' | 'users') => FirebaseImageData | undefined;
    getImagesByFolder: (folder: 'badges' | 'threads' | 'users') => FirebaseImageData[];
    clearCache: () => void; // Add cache clearing method
}

const CACHE_DURATION = 1 * 60 * 60 * 1000; // Reduced to 1 hour for testing
// const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for production

export const useImagesStore = create<ImagesState>()(
    persist(
        (set, get) => ({
            images: [],
            isLoading: false,
            error: null,
            lastUpdated: null,

            loadImages: async (forceRefresh = false) => {
                const state = get();
                
                // Skip cache if forceRefresh is true
                if (
                    !forceRefresh &&
                    state.images.length > 0 &&
                    state.lastUpdated &&
                    Date.now() - state.lastUpdated < CACHE_DURATION
                ) {
                    console.log('[imgStore] Using cached images');
                    return;
                }

                console.log('[imgStore] Loading images from Firebase...');
                set({ isLoading: true, error: null });

                try {
                    const storage = getStorage();
                    const folders: ('badges' | 'threads' | 'users')[] = ['badges', 'threads', 'users'];

                    const allImages = await Promise.all(
                        folders.map(async (folder) => {
                            try {
                                const folderRef = ref(storage, folder);
                                const listResult = await listAll(folderRef);
                                
                                console.log(`[imgStore] Found ${listResult.items.length} items in ${folder} folder`);

                                const folderImages = await Promise.all(
                                    listResult.items.map(async (item) => {
                                        try {
                                            const url = await getDownloadURL(item);
                                            return {
                                                name: item.name,
                                                url: url,
                                                path: item.fullPath,
                                                folder: folder,
                                            };
                                        } catch (error) {
                                            console.error(`[imgStore] Error getting download URL for ${item.name}:`, error);
                                            return null;
                                        }
                                    })
                                );

                                // Filter out null values (failed downloads)
                                return folderImages.filter(img => img !== null) as FirebaseImageData[];
                            } catch (error) {
                                console.error(`[imgStore] Error loading ${folder} folder:`, error);
                                return [];
                            }
                        })
                    );

                    const images = allImages.flat();
                    console.log(`[imgStore] Successfully loaded ${images.length} images`);
                    
                    // Log user images specifically
                    const userImages = images.filter(img => img.folder === 'users');
                    console.log(`[imgStore] User images:`, userImages.map(img => img.name));
                    
                    set({
                        images,
                        isLoading: false,
                        error: null,
                        lastUpdated: Date.now(),
                    });
                } catch (error) {
                    console.error('[imgStore] Error loading images:', error);
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Failed to load images',
                    });
                }
            },

            refreshImages: async () => {
                console.log('[imgStore] Force refreshing images...');
                await get().loadImages(true);
            },

            getImageByName: (name: string, folder?: 'badges' | 'threads' | 'users') => {
                const images = get().images;
                
                // Try exact match first
                let found = images.find(img => {
                    const nameMatch = img.name === name;
                    const folderMatch = folder ? img.folder === folder : true;
                    return nameMatch && folderMatch;
                });

                // If not found, try case-insensitive match
                if (!found) {
                    found = images.find(img => {
                        const nameMatch = img.name.toLowerCase() === name.toLowerCase();
                        const folderMatch = folder ? img.folder === folder : true;
                        return nameMatch && folderMatch;
                    });
                }

                // If still not found, try with .png extension
                if (!found && !name.includes('.')) {
                    found = images.find(img => {
                        const nameMatch = img.name.toLowerCase() === `${name.toLowerCase()}.png`;
                        const folderMatch = folder ? img.folder === folder : true;
                        return nameMatch && folderMatch;
                    });
                }

                if (found) {
                    console.log(`[imgStore] Found image for "${name}":`, found.name);
                } else {
                    console.log(`[imgStore] No image found for "${name}" in folder "${folder}"`);
                }

                return found;
            },

            getImagesByFolder: (folder: 'badges' | 'threads' | 'users') => {
                const images = get().images.filter(img => img.folder === folder);
                console.log(`[imgStore] Retrieved ${images.length} images from ${folder} folder`);
                return images;
            },

            clearCache: () => {
                console.log('[imgStore] Clearing cache...');
                set({
                    images: [],
                    lastUpdated: null,
                    error: null
                });
            }
        }),
        {
            name: 'images-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                images: state.images,
                lastUpdated: state.lastUpdated,
            }),
        }
    )
);