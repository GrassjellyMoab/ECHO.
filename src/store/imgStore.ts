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
    loadImages: () => Promise<void>;
    getImageByName: (name: string) => FirebaseImageData | undefined;
    getImagesByFolder: (folder: 'badges' | 'threads' | 'users') => FirebaseImageData[];
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useImagesStore = create<ImagesState>()(
    persist(
        (set, get) => ({
            images: [],
            isLoading: false,
            error: null,
            lastUpdated: null,

            loadImages: async () => {
                const state = get();
                if (
                    state.images.length > 0 &&
                    state.lastUpdated &&
                    Date.now() - state.lastUpdated < CACHE_DURATION
                ) {
                    console.log('[imgStore] Using cached images');
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const storage = getStorage();
                    const folders: ('badges' | 'threads' | 'users')[] = ['badges', 'threads', 'users'];

                    const allImages = await Promise.all(
                        folders.map(async (folder) => {
                            const folderRef = ref(storage, folder);
                            const listResult = await listAll(folderRef);

                            return Promise.all(
                                listResult.items.map(async (item) => ({
                                    name: item.name,
                                    url: await getDownloadURL(item),
                                    path: item.fullPath,
                                    folder: folder,
                                }))
                            );
                        })
                    );

                    const images = allImages.flat(); // Combine all folder arrays
                    console.log(`[imgStore] Loaded ${images.length} images`);
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
            getImageByName: (name: string) => {
                return get().images.find(img => img.name === name);
            },

            getImagesByFolder: (folder: 'badges' | 'threads' | 'users') => {
                return get().images.filter(img => img.folder === folder);
            },
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
