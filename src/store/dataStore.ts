import {
    collection,
    DocumentChange,
    getDocs,
    onSnapshot,
    QuerySnapshot
} from 'firebase/firestore';
import { isEqual } from 'lodash';
import { useMemo } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { db } from '../firebase/config';

interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
}

interface Topic {
    id: string;
    topic: string;
    num_vigilants: number;
    is_rising: boolean;
    is_trending: boolean;
}

interface Thread {
    id: string;
    ai_verdict: string;
    description: string;
    is_real: boolean;
    num_comments: number;
    num_views: number;
    num_votes: number;
    posted_datetime: Date;
    profile_img: string;
    read_duration: number;
    sources: string[];
    thread_img: string;
    title: string;
    topics: string[];
    uid: string;
}

interface VoteHistory {
    id: string;
    topic_id: string[];
    uid: string;
    voted_real: boolean;
}

interface Leaderboard {
    id: string;
    start_date: Date;
    end_date: Date;
    points: number;
}

interface Comment {
    id: string;
    date: Date;
    is_pinned: boolean;
    num_likes: number;
    num_replies: number;
    reply_cid: string;
    text: string;
    tid: string;
    topic_id: string;
    uid: string;
}

interface Connections {
    id: string;
    followee: string;
    following: string;
}

// Collection types mapping
interface CollectionTypes {
    users: User;
    topics: Topic;
    threads: Thread;
    vote_history: VoteHistory;
    leaderboard: Leaderboard;
    comments: Comment;
    connections: Connections;
}

type CollectionName = keyof CollectionTypes;

interface DataStoreState {
    data: Map<CollectionName, Map<string, CollectionTypes[CollectionName]>>;
    loading: boolean;
    error: string | null;
    initialized: boolean;
    unsubscribers: Map<CollectionName, () => void>;
}

interface DataStoreActions {
    initialize: () => Promise<void>;
    loadCollection: <T extends CollectionName>(collectionName: T) => Promise<void>;
    handleCollectionUpdate: <T extends CollectionName>(
        collectionName: T,
        snapshot: QuerySnapshot
    ) => void;
    getCollection: <T extends CollectionName>(collectionName: T) => Map<string, CollectionTypes[T]>;
    getDocument: <T extends CollectionName>(collectionName: T, docId: string) => CollectionTypes[T] | null;
    getDocuments: <T extends CollectionName>(
        collectionName: T,
        filter?: (doc: CollectionTypes[T]) => boolean
    ) => CollectionTypes[T][];
    searchDocuments: <T extends CollectionName>(
        collectionName: T,
        searchTerm: string,
        fields?: (keyof CollectionTypes[T])[]
    ) => CollectionTypes[T][];
    cleanup: () => void;
    refreshCollection: <T extends CollectionName>(collectionName: T) => Promise<void>;
}

type DataStore = DataStoreState & DataStoreActions;

export const useDataStore = create<DataStore>()(
    subscribeWithSelector((set, get) => ({
        data: new Map(),
        loading: false,
        error: null,
        initialized: false,
        unsubscribers: new Map(),

        initialize: async (): Promise<void> => {
            const state = get();
            if (state.initialized || state.loading) return;  // prevent multiple calls

            set({ loading: true, error: null });

            try {
                await Promise.all([
                    state.loadCollection('users'),
                    state.loadCollection('topics'),
                    state.loadCollection('threads'),
                    state.loadCollection('vote_history'),
                    state.loadCollection('leaderboard'),
                    state.loadCollection('comments'),
                    state.loadCollection('connections'),
                ]);

                set({ initialized: true, loading: false });
            } catch (error: any) {
                console.error('Failed to initialize data store:', error);
                set({ error: error.message, loading: false });
            }
        },

        loadCollection: async <T extends CollectionName>(collectionName: T): Promise<void> => {
            try {
                const snapshot = await getDocs(collection(db, collectionName));
                const collectionData = new Map<string, CollectionTypes[T]>();

                snapshot.forEach(doc => {
                    const docData = {
                        id: doc.id,
                        ...doc.data(),
                    } as CollectionTypes[T];

                    collectionData.set(doc.id, docData);
                });

                set(state => {
                    const newData = new Map(state.data);
                    newData.set(collectionName, collectionData as Map<string, any>);
                    return { data: newData };
                });

                const unsubscriber = onSnapshot(
                    collection(db, collectionName),
                    (snapshot) => {
                        if (!snapshot.metadata.hasPendingWrites) {
                            get().handleCollectionUpdate(collectionName, snapshot);
                        }
                    },
                    (error) => {
                        console.error(`Error listening to ${collectionName}:`, error);
                        set(state => ({ ...state, error: error.message }));
                    }
                );

                set(state => {
                    const newUnsubscribers = new Map(state.unsubscribers);
                    newUnsubscribers.set(collectionName, unsubscriber);
                    return { unsubscribers: newUnsubscribers };
                });

            } catch (error: any) {
                console.error(`Failed to load ${collectionName}:`, error);
                throw error;
            }
        },

        handleCollectionUpdate: <T extends CollectionName>(
            collectionName: T,
            snapshot: QuerySnapshot
        ): void => {
            const state = get();
            const currentCollection = state.data.get(collectionName) as Map<string, CollectionTypes[T]> | undefined;
            const updatedCollection = new Map(currentCollection || new Map());

            let hasChanges = false;

            snapshot.docChanges().forEach((change: DocumentChange) => {
                const docId = change.doc.id;
                const docData = {
                    id: docId,
                    ...change.doc.data(),
                } as CollectionTypes[T];

                switch (change.type) {
                    case 'added':
                        updatedCollection.set(docId, docData);
                        hasChanges = true;
                        break;
                    case 'modified': {
                        const currentDoc = updatedCollection.get(docId);
                        if (!isEqual(currentDoc, docData)) {
                            updatedCollection.set(docId, docData);
                            hasChanges = true;
                        }
                        break;
                    }
                    case 'removed':
                        if (updatedCollection.has(docId)) {
                            updatedCollection.delete(docId);
                            hasChanges = true;
                        }
                        break;
                }
            });

            if (hasChanges) {
                set(state => {
                    const newData = new Map(state.data);
                    newData.set(collectionName, updatedCollection as Map<string, any>);
                    return { data: newData };
                });
            }
        },


        getCollection: <T extends CollectionName>(collectionName: T): Map<string, CollectionTypes[T]> => {
            const collection = get().data.get(collectionName) as Map<string, CollectionTypes[T]> | undefined;
            return collection || new Map();
        },

        getDocument: <T extends CollectionName>(collectionName: T, docId: string): CollectionTypes[T] | null => {
            const collection = get().data.get(collectionName) as Map<string, CollectionTypes[T]> | undefined;
            return collection?.get(docId) || null;
        },

        getDocuments: <T extends CollectionName>(
            collectionName: T,
            filter?: (doc: CollectionTypes[T]) => boolean
        ): CollectionTypes[T][] => {
            const collection = get().data.get(collectionName) as Map<string, CollectionTypes[T]> | undefined;
            if (!collection) return [];

            const docs = Array.from(collection.values());
            return filter ? docs.filter(filter) : docs;
        },

        searchDocuments: <T extends CollectionName>(
            collectionName: T,
            searchTerm: string,
            fields: (keyof CollectionTypes[T])[] = []
        ): CollectionTypes[T][] => {
            const collection = get().data.get(collectionName) as Map<string, CollectionTypes[T]> | undefined;
            if (!collection || !searchTerm) return [];

            return Array.from(collection.values()).filter(doc => {
                if (fields.length === 0) {
                    return Object.values(doc as Record<string, any>).some(value =>
                        typeof value === 'string' &&
                        value.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                } else {
                    return fields.some(field => {
                        const value = doc[field];
                        return value &&
                            typeof value === 'string' &&
                            value.toLowerCase().includes(searchTerm.toLowerCase());
                    });
                }
            });
        },

        cleanup: (): void => {
            const state = get();
            state.unsubscribers.forEach(unsubscriber => {
                if (typeof unsubscriber === 'function') {
                    unsubscriber();
                }
            });

            set({
                data: new Map(),
                unsubscribers: new Map(),
                initialized: false,
                loading: false,
                error: null
            });
        },

        refreshCollection: async <T extends CollectionName>(collectionName: T): Promise<void> => {
            const state = get();
            const existingUnsubscriber = state.unsubscribers.get(collectionName);
            if (existingUnsubscriber) {
                existingUnsubscriber();
                set(state => {
                    const newUnsubscribers = new Map(state.unsubscribers);
                    newUnsubscribers.delete(collectionName);
                    return { unsubscribers: newUnsubscribers };
                });
            }

            await state.loadCollection(collectionName);
        }
    }))
);

export const initializeDataStore = async (): Promise<void> => {
    const store = useDataStore.getState();
    await store.initialize();
};

export const cleanupDataStore = (): void => {
    const store = useDataStore.getState();
    store.cleanup();
};

export const useCollectionData = <T extends CollectionName>(
    collectionName: T
): CollectionTypes[T][] => {
    const initialized = useDataStore(state => state.initialized);
    const dataMap = useDataStore(state => state.data.get(collectionName) as Map<string, CollectionTypes[T]> | undefined);

    // Memoize the array so the returned reference does not change unnecessarily
    return useMemo(() => {
        if (!initialized || !dataMap) return [];
        return Array.from(dataMap.values());
    }, [initialized, dataMap]);
};

export const useDocumentData = <T extends CollectionName>(
    collectionName: T,
    docId: string
): CollectionTypes[T] | null => {
    const initialized = useDataStore(state => state.initialized);
    const dataMap = useDataStore(state => state.data.get(collectionName) as Map<string, CollectionTypes[T]> | undefined);

    return useMemo(() => {
        if (!initialized || !dataMap) return null;
        return dataMap.get(docId) || null;
    }, [initialized, dataMap, docId]);
};

export const useFilteredDocuments = <T extends CollectionName>(
    collectionName: T,
    filter: (doc: CollectionTypes[T]) => boolean
): CollectionTypes[T][] => {
    const initialized = useDataStore(state => state.initialized);
    const dataMap = useDataStore(state => state.data.get(collectionName) as Map<string, CollectionTypes[T]> | undefined);

    return useMemo(() => {
        if (!initialized || !dataMap) return [];
        const docs = Array.from(dataMap.values());
        return docs.filter(filter);
    }, [initialized, dataMap, filter]);
};
