import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SwipeResultModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  claim?: string;
  imageUri?: string;
  content?: string;
  onSeeThread?: (threadData: ThreadData) => void;
}

interface ThreadData {
  id: string;
  author: string;
  title: string;
  timeAgo: string;
  readTime: string;
  views: string;
  comments: string;
  votes: string;
  tags: string[];
  hasImage?: boolean;
  isVerified?: boolean;
  avatar?: string;
  threadImageUrl?: string;
  content: string;
  real_ratio: number;
  ai_verdict?: string;
  hasVoted: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// TODO: not enough information + truncate the justification else adjust text size if no choice
const callDEFAMEAPI = async (claim: string, imageUri?: string) => {
  try {
    const baseURL = Platform.select({
      ios: 'http://localhost:3004',
      android: 'http://10.0.2.2:3004',
      default: 'http://localhost:3004'
    });

    const content: Array<[string, string]> = [];

    if (imageUri) {
      console.log('Processing image for fact-check:', imageUri);
      
      try {
        // Convert image to base64
        const response = await fetch(imageUri);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        if (!blob || blob.size === 0) {
          throw new Error('Invalid image data received');
        }
        
        console.log('Image blob size:', blob.size, 'type:', blob.type);
        
        const imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            if (!base64 || !base64.includes(',')) {
              reject(new Error('Failed to convert image to base64'));
              return;
            }
            resolve(base64.split(',')[1]); // Remove data:image prefix
          };
          reader.onerror = () => reject(new Error('FileReader error'));
          reader.readAsDataURL(blob);
        });

        console.log('Image converted to base64, length:', imageBase64.length);

        // Add content as exact tuples that DEFAME expects
        if (claim && claim.trim()) {
          // Both text and image
          content.push(["text", `Please fact-check this claim: "${claim}"`]);
          content.push(["text", "The image is related to this claim:"]);
          content.push(["image", imageBase64]);
        } else {
          // Image only
          content.push(["text", "Please fact-check the claims or information shown in this image:"]);
          content.push(["image", imageBase64]);
        }
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        // Fallback to text-only
        if (claim && claim.trim()) {
          content.push(["text", claim]);
          console.log('Falling back to text-only fact-check due to image error');
        } else {
          throw new Error('Cannot process image and no text claim provided');
        }
      }
    } else {
      // Text-only content
      if (!claim || !claim.trim()) {
        throw new Error('No claim text or image provided for fact-checking');
      }
      
      // Simple text claim as tuple
      content.push(["text", claim]);
    }

    // Build the exact request body that DEFAME expects
    const requestBody = {
      content: content,
      date: new Date().toISOString().split('T')[0]
    };

    console.log('Submitting to DEFAME with exact tuple format:');
    console.log('Content length:', content.length);
    console.log('Content structure:', content.map(([type, data], index) => 
      `${index}: [${type}, ${data.substring(0, 50)}${data.length > 50 ? '...' : ''}]`
    ));
    console.log('Date:', requestBody.date);

    // Submit to DEFAME server
    const submitResponse = await fetch(`${baseURL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('DEFAME API Error Response:', errorText);
      throw new Error(`API Error: ${submitResponse.status} - ${errorText}`);
    }

    const result = await submitResponse.json();
    
    console.log('DEFAME Response received successfully');
    console.log('Response type:', typeof result);
    console.log('Response keys:', Object.keys(result || {}));
    console.log('Response preview:', JSON.stringify(result).substring(0, 500));

    if (result.error) {
      throw new Error(result.error);
    }

    return parseLocalDEFAMEResults(result);

  } catch (error) {
    console.error('DEFAME API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Fact-checking failed: ${errorMessage}`);
  }
};

// Enhanced parsing function with better error handling and debugging
const parseLocalDEFAMEResults = (result: any) => {
  try {
    console.log('Parsing DEFAME result:', JSON.stringify(result, null, 2));
    
    let verdict: 'REAL' | 'FAKE' | 'AMBIGUOUS' = 'REAL';
    let explanation = 'Fact-check completed.';
    
    // Handle different possible response structures
    if (typeof result === 'string') {
      try {
        result = JSON.parse(result);
      } catch (parseError) {
        console.error('Failed to parse string result as JSON:', parseError);
        return {
          verdict: 'REAL' as const,
          explanation: 'Received invalid response format from fact-check service.',
          sources: ['System Error']
        };
      }
    }
    
    // Check different possible response structures
    if (result.claims) {
      // Original structure with claims object
      const claimEntries = Object.values(result.claims);
      
      for (const claim of claimEntries as any[]) {
        // FIXED: Extract verdict from the detailed justification text, not the top-level verdict
        if (claim.justification && Array.isArray(claim.justification)) {
          const justificationTexts = claim.justification
            .filter(([type, _]: [string, string]) => type === 'text')
            .map(([_, text]: [string, string]) => text)
            .join(' ');
          
          // Look for the actual verdict in the justification text
          const verdictMatch = justificationTexts.match(/### Verdict:\s*(SUPPORTED|REFUTED|NOT ENOUGH INFORMATION)/i);
          if (verdictMatch) {
            const actualVerdict = verdictMatch[1].toLowerCase();
            if (actualVerdict.includes('refuted') || actualVerdict.includes('not supported')) {
              verdict = 'FAKE';
            } else if (actualVerdict.includes('supported')) {
              verdict = 'REAL';
            } else if (actualVerdict.includes('not enough information')) {
              verdict = 'AMBIGUOUS';
            }
            
            console.log('Extracted actual verdict from justification:', actualVerdict);
          } else {
            // Fallback: look for verdict keywords in the justification text
            const lowerJustification = justificationTexts.toLowerCase();
            if (lowerJustification.includes('refuted') || 
                lowerJustification.includes('not supported') || 
                lowerJustification.includes('false') ||
                lowerJustification.includes('insufficient evidence') ||
                lowerJustification.includes('misleading') ||
                lowerJustification.includes('inaccurate')) {
              verdict = 'FAKE';
            } else if (lowerJustification.includes('supported') || 
                      lowerJustification.includes('confirmed') ||
                      lowerJustification.includes('verified') ||
                      lowerJustification.includes('accurate')) {
              verdict = 'REAL';
            }else if (lowerJustification.includes('unsure') || 
                      lowerJustification.includes('not enough') ||
                      lowerJustification.includes('not enough information')) {
              verdict = 'AMBIGUOUS';
            }
          }
          
          // Extract clean explanation (remove markdown and redundant text)
          if (justificationTexts.trim()) {
            // Extract the "Final Judgement" or "Elaboration" section if available
            const finalJudgementMatch = justificationTexts.match(/## Final Judgement\s*([\s\S]*?)(?=###|$)/i);
            const elaborationMatch = justificationTexts.match(/## Elaboration\s*([\s\S]*?)(?=##|$)/i);
            const evidenceMatch = justificationTexts.match(/## Evidence\s*([\s\S]*?)(?=##|$)/i);
            
            if (finalJudgementMatch) {
              explanation = finalJudgementMatch[1].trim();
            } else if (elaborationMatch) {
              explanation = elaborationMatch[1].trim();
            } else if (evidenceMatch) {
              explanation = evidenceMatch[1].trim();
            } else {
              // Fallback to full justification text
              explanation = justificationTexts;
            }
            
            // Clean up the explanation
            explanation = explanation
              .replace(/##\s*/g, '')
              .replace(/###\s*/g, '')
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/Summary:\s*/gi, '')
              .replace(/The claim.*?is supported\./gi, '')
              .replace(/Verdict:\s*(SUPPORTED|REFUTED|NOT SUPPORTED)/gi, '')
              .replace(/Justification\s*/gi, '')
              .replace(/Multiple sources.*?refuting the claim\./gi, '')
              .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
              .replace(/```[\s\S]*?```/g, '') // Remove code blocks
              .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
              .trim();
          }
        }
        
        // WARNING: Don't use the top-level verdict as it may be incorrect
        console.warn('Top-level verdict ignored due to potential inconsistency:', claim.verdict);
      }
    } else if (result.verdict) {
      // Handle direct verdict structure - but still be cautious
      console.warn('Using direct verdict structure - verify consistency');
      const v = result.verdict.toLowerCase();
      if (v.includes('refuted') || v.includes('false') || v.includes('not supported')) {
        verdict = 'FAKE';
      } else if (v.includes('supported') || v.includes('true')) {
        verdict = 'REAL';
      } else if (v.includes('not enough information')) {
        verdict = 'AMBIGUOUS';
      }
      
      if (result.explanation || result.justification) {
        explanation = result.explanation || result.justification;
      }
    } else if (result.analysis) {
      // Alternative structure with analysis field
      if (result.analysis.verdict) {
        const v = result.analysis.verdict.toLowerCase();
        if (v.includes('refuted') || v.includes('false') || v.includes('not supported')) {
          verdict = 'FAKE';
        } else if (v.includes('supported') || v.includes('true')) {
          verdict = 'REAL';
        } else if (v.includes('not enough information')) {
          verdict = 'AMBIGUOUS';
        }
      }
      
      if (result.analysis.explanation) {
        explanation = result.analysis.explanation;
      }
    } else if (Array.isArray(result)) {
      // Handle array response
      for (const item of result) {
        if (item.verdict) {
          const v = item.verdict.toLowerCase();
          if (v.includes('refuted') || v.includes('false') || v.includes('not supported')) {
            verdict = 'FAKE';
          } else if (v.includes('supported') || v.includes('true')) {
            verdict = 'REAL';
          } else if (v.includes('not enough information')) {
            verdict = 'AMBIGUOUS';
          }
        }
        
        if (item.explanation || item.justification) {
          explanation = item.explanation || item.justification;
          break;
        }
      }
    } else {
      console.warn('Unexpected DEFAME response structure:', result);
      const resultString = JSON.stringify(result);
      if (resultString.length > 20) {
        explanation = 'Fact-check analysis completed, but response format was unexpected.';
      }
    }
    
    // Final cleanup and validation
    if (typeof explanation === 'string') {
      explanation = explanation
        .replace(/\[.*?\]\(.*?\)/g, '') // Remove any remaining markdown links
        .replace(/```[\s\S]*?```/g, '') // Remove any remaining code blocks
        .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
        .trim();
    }
    
    if (!explanation || explanation.length < 10) {
      explanation = verdict === 'REAL' 
        ? 'This claim appears to be supported by available evidence.'
        : 'This claim has been refuted or is not supported by available evidence.';
    }

    const words = explanation.split(' ');
    const truncatedExplanation = words.length > 30 
      ? words.slice(0, 30).join(' ') + '...'
      : explanation;
    
    console.log('Final parsed verdict:', verdict);
    console.log('Final explanation length:', explanation.length);
    
    // Extract actual sources from justification text
    let extractedSources: string[] = [];
    
    if (result.claims) {
      const claimEntries = Object.values(result.claims);
      
      for (const claim of claimEntries as any[]) {
        if (claim.justification && Array.isArray(claim.justification)) {
          const justificationTexts = claim.justification
            .filter(([type, _]: [string, string]) => type === 'text')
            .map(([_, text]: [string, string]) => text)
            .join(' ');
          
          // Extract sources from markdown links like [NASA](https://...)
          const sourceMatches = justificationTexts.match(/\[([^\]]+)\]\([^)]+\)/g);
          if (sourceMatches) {
            const sources = sourceMatches.map((match: string) => {
              const nameMatch = match.match(/\[([^\]]+)\]/);
              return nameMatch ? nameMatch[1] : match;
            });
            extractedSources.push(...sources);
          }
          
          // Extract sources from brackets like [Straits Times] or [Mothership]
          const bracketMatches = justificationTexts.match(/\[([^\]]+)\]/g);
          if (bracketMatches) {
            const bracketSources = bracketMatches
              .map((match: string) => match.replace(/[\[\]]/g, '').trim())
              .filter((source: string) => {
                // Filter out common non-source brackets like [text], [image], etc.
                const lowerSource = source.toLowerCase();
                return !lowerSource.includes('text') && 
                       !lowerSource.includes('image') && 
                       !lowerSource.includes('url') &&
                       source.length > 2 && 
                       source.length < 50;
              });
            extractedSources.push(...bracketSources);
          }
          
          // Also look for mentions like "according to NASA" or "sources like NASA"
          const mentionMatches = justificationTexts.match(/(?:according to|sources? like|from|via)\s+([A-Z][A-Za-z\s&]+?)(?:\s|,|\.|$)/g);
          if (mentionMatches) {
            const mentions = mentionMatches.map((match: string) => 
              match.replace(/(?:according to|sources? like|from|via)\s+/, '').trim().replace(/[,.]$/, '')
            ).filter((mention: string | any[]) => mention.length > 1 && mention.length < 50);
            extractedSources.push(...mentions);
          }
        }
      }
    }
    
    // Remove duplicates and clean up source names
    const uniqueSources = [...new Set(extractedSources)]
      .map(source => source.trim())
      .filter(source => source.length > 1)
      .slice(0, 5); // Limit to max 5 sources for UI
    
    // Fallback to generic if no sources found
    const finalSources = uniqueSources.length > 0 
      ? uniqueSources 
      : ['DEFAME AI Analysis'];
    
    console.log('Extracted sources:', finalSources);
    
    return {
      verdict,
      explanation,
      sources: finalSources
    };
    
  } catch (error) {
    console.error('Error parsing DEFAME results:', error);
    console.error('Original result object:', result);
    throw new Error('Unable to parse fact-check results properly.');
  }
};

// Updated SwipeResultModal component with better error handling
export const SwipeResultModal: React.FC<SwipeResultModalProps> = ({
    visible,
    onClose,
    title,
    claim,
    imageUri,
    content,
    onSeeThread
}) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<'REAL' | 'FAKE' | 'AMBIGUOUS'>('REAL');
  const [explanation, setExplanation] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [truncatedExplanation, setTruncatedExplanation] = useState(''); 

  // Call DEFAME API when modal becomes visible
  useEffect(() => {
    if (visible && (claim || imageUri)) {
      setLoading(true);
      setError(null);
      
      const factCheck = async () => {
        try {
          console.log('Starting fact-check with:', { 
            hasText: !!claim, 
            hasImage: !!imageUri,
            textLength: claim?.length || 0,
            claimPreview: claim?.substring(0, 100)
          });
          
          const factCheckResult = await callDEFAMEAPI(claim || '', imageUri);
          
          setResult(factCheckResult.verdict);
          setExplanation(factCheckResult.explanation);
          setSources(factCheckResult.sources);
          setError(null);

          console.log('Fact-check completed successfully:', {
            verdict: factCheckResult.verdict,
            explanationLength: factCheckResult.explanation.length,
            sourcesCount: factCheckResult.sources.length
          });
        } catch (err) {
          console.error('Fact-check error:', err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(errorMessage);
          
          // Set fallback values
          setResult('REAL');
          setExplanation(`Unable to complete fact-check: ${errorMessage}`);
          setSources(['Error']);
        } finally {
          setLoading(false);
        }
      };

      factCheck();
    }
  }, [visible, claim, imageUri]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setLoading(true);
      setResult('REAL');
      setExplanation('');
      setSources([]);
      setError(null);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="close" size={32} color="#666" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/Judge.png')}
              style={{width: 70, height: 70, tintColor: 'black'}}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {loading ? (
            // Loading State
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#662D91" />
              <Text style={styles.loadingText}>
                {imageUri && claim 
                  ? 'Fact-checking claim and image...' 
                  : imageUri 
                    ? 'Analyzing image...'
                    : 'Fact-checking claim...'
                }
              </Text>
            </View>
          ) : (
            <>
              {/* Result */}
              <View style={styles.resultContainer}>
                <View style={styles.resultIconBackground}>
                <Image
                  source={
                    result === 'REAL' 
                      ? require('../../assets/tick.png')
                      : result === 'FAKE' || error
                      ? require('../../assets/cross.png')
                      : require('../../assets/question.png') 
                  }
                  style={styles.backgroundIcon}
                  resizeMode="contain"
                />
                  <Text style={[styles.resultText, { color: '#000' }]}>
                    {error ? 'ERROR' : result}.
                  </Text>
                </View>
              </View>

              {/* Why Section */}
              <Text style={styles.whyTitle}>
                {error ? 'ERROR DETAILS:' : 'WHY?'}
              </Text>
              <Text style={styles.explanation}>
                {(() => {
                  const words = explanation.split(' ');
                  const truncatedExplanation = words.length > 30 
                    ? words.slice(0, 30).join(' ') + '...'
                    : explanation;
                  
                    return (
                      <>
                        {words.length > 30 ? truncatedExplanation : explanation}
                        {words.length > 30 && onSeeThread && (
                          <Text 
                            style={styles.seeMoreText} 
                            onPress={() => {
                              const threadData: ThreadData = {
                                id: Date.now().toString(), // Generate unique ID
                                author: '@user', // You can get this from auth store
                                title: title,
                                timeAgo: 'Just now',
                                readTime: '2 min read',
                                views: '0',
                                comments: '0',
                                votes: '0',
                                tags: ['Fact-check'], // Default tag
                                hasImage: !!imageUri,
                                isVerified: false,
                                avatar: undefined,
                                threadImageUrl: imageUri,
                                content: content || 'No description provided', // Full explanation as content
                                real_ratio: 0, // No votes yet
                                ai_verdict: explanation, // Pass the verdict result
                                hasVoted: false
                              };
                              onSeeThread(threadData);
                            }}
                          >
                            {' '}SEE MORE
                          </Text>
                        )}
                      </>
                    );
                })()}
              </Text>
              {/* Sources */}
              <Text style={styles.sourcesTitle}>SOURCES:</Text>
              <View style={styles.sourcesContainer}>
                {sources.map((source, index) => (
                  <View key={index} style={[
                    styles.sourceTag, 
                    error && styles.sourceTagError
                  ]}>
                    <Text style={styles.sourceText}>{source}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'AnonymousPro-Bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'AnonymousPro',
  },
  resultContainer: {
    marginBottom: 24,
  },
  resultIconBackground: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundIcon: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
    zIndex: 1,
  },
  whyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'AnonymousPro-Bold',
  },
  explanation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'AnonymousPro',
  },
  sourcesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'AnonymousPro-Bold',
  },
  sourceTagError: {
    backgroundColor: '#dc2626', // Red color for error
  },
  sourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  sourceTag: {
    backgroundColor: '#662D91',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sourceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'AnonymousPro-Bold',
  },
  seeThreadButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    paddingBottom: 2,
  },
  seeThreadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'AnonymousPro-Bold',
  },
  seeMoreText: {
    color: '#662D91',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: 'AnonymousPro-Bold',
  },
});