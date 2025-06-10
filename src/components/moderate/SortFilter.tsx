import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface ThreadData {
    id: string;
    author: string;
    title: string;
    timeAgo: string;
    dateCreated: Timestamp;
    readTime: string;
    views: string;
    comments: string;
    votes: string;
    tags: string[];
    hasImage?: boolean;
    isVerified?: boolean;
    avatar?: string;
    threadImageUrl?: string;
    content?: string;
    real_ratio: number;
    ai_verdict?: string;
    hasVoted: boolean;
}

interface FlaggedCommentData {
    id: string;
    date: Date;
    is_flagged: boolean;
    is_pinned: boolean;
    num_likes: number;
    num_replies: number;
    reply_cid: string;
    text: string;
    tid: string;
    topic_id: string;
    uid: string;
    thread?: ThreadData; // Add thread data
}

interface SortFilterProps {
    comments: FlaggedCommentData[];
    onCommentsChange: (comments: FlaggedCommentData[]) => void;
    styles: any; // Replace with your actual styles type
}

const SortFilterComponent: React.FC<SortFilterProps> = ({ comments, onCommentsChange, styles }) => {
    const [showSortModal, setShowSortModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedSort, setSelectedSort] = useState('newest');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    
    // Get unique categories from all comments
    const allCategories = Array.from(new Set(
        comments.flatMap(comment => comment.thread?.tags || [])
    ));

    const sortOptions = [
        { id: 'newest', label: 'Newest First' },
        { id: 'oldest', label: 'Oldest First' },
    ];

    const applySortAndFilter = (sortType: string, categories: string[]) => {
        let filteredComments = [...comments];

        // Apply category filter
        if (categories.length > 0) {
            filteredComments = filteredComments.filter(comment => 
                comment.thread?.tags?.some(tag => categories.includes(tag))
            );
        }

        // Apply sort
        filteredComments.sort((a, b) => {
            const aDate = a.thread?.dateCreated?.seconds ?? 0;
            const bDate = b.thread?.dateCreated?.seconds ?? 0;
            
            return sortType === 'newest' ? bDate - aDate : aDate - bDate;
        });

        onCommentsChange(filteredComments);
    };

    const handleSort = (sortType: string) => {
        setSelectedSort(sortType);
        setShowSortModal(false);
        applySortAndFilter(sortType, selectedCategories);
    };

    const handleCategoryToggle = (category: string) => {
        const newCategories = selectedCategories.includes(category)
            ? selectedCategories.filter(c => c !== category)
            : [...selectedCategories, category];
        
        setSelectedCategories(newCategories);
    };

    const applyFilter = () => {
        setShowFilterModal(false);
        applySortAndFilter(selectedSort, selectedCategories);
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setShowFilterModal(false);
        applySortAndFilter(selectedSort, []);
    };

    return (
        <View style={styles.listBtns}>
            {/* Sort Button */}
            <TouchableOpacity 
                style={styles.filterBtn} 
                onPress={() => setShowSortModal(true)}
            >
                <IconSymbol style={styles.filterIcon} name="sort" size={16} color="#666" />
                <Text style={styles.filterBtnText}>Sort</Text>
            </TouchableOpacity>

            {/* Filter Button */}
            <TouchableOpacity 
                style={styles.filterBtn} 
                onPress={() => setShowFilterModal(true)}
            >
                <IconSymbol style={styles.filterIcon} name="funnel" size={16} color="#666" />
                <Text style={styles.filterBtnText}>
                    Filter {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                </Text>
            </TouchableOpacity>

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSortModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSortModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sort by</Text>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.modalOption,
                                    selectedSort === option.id && styles.selectedOption
                                ]}
                                onPress={() => handleSort(option.id)}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    selectedSort === option.id && styles.selectedOptionText
                                ]}>
                                    {option.label}
                                </Text>
                                {selectedSort === option.id && (
                                    <IconSymbol name="checkmark" size={16} color="#007AFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFilterModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filter by Categories</Text>
                        <ScrollView style={styles.modalScrollView}>
                            {allCategories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.modalOption,
                                        selectedCategories.includes(category) && styles.selectedOption
                                    ]}
                                    onPress={() => handleCategoryToggle(category)}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        selectedCategories.includes(category) && styles.selectedOptionText
                                    ]}>
                                        {category}
                                    </Text>
                                    {selectedCategories.includes(category) && (
                                        <IconSymbol name="checkmark" size={16} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={clearFilters}
                            >
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={applyFilter}
                            >
                                <Text style={styles.applyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

// Add these styles to your stylesheet
export const additionalStyles = {
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 300,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalScrollView: {
        maxHeight: 300,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
    },
    selectedOption: {
        backgroundColor: '#E3F2FD',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    clearButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#666',
        fontSize: 16,
    },
    applyButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#007AFF',
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
};

export default SortFilterComponent;