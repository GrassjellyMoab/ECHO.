import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedInput } from '@/src/components/ui/ThemedInput';
import { ThemedText } from '@components/ThemedText';
import { useAuthStore } from '../../src/store/authStore';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AuthScreen() {
  const router = useRouter();
  const { login, register, isLoading } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [authError, setAuthError] = useState<string>('');

  const handleInput = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!isLogin) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('Attempting submission with data:', formData);
    
    // Clear any previous auth errors
    setAuthError('');
  
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      let result;
      
      if (isLogin) {
        result = await login({
          username: formData.username,
          password: formData.password
        });
      } else {
        result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
      }

      if (result.success) {
        console.log(`${isLogin ? 'Login' : 'Registration'} successful!`);
        // Navigation will be handled automatically by the layout
      } else {
        // Show the specific error message inline
        setAuthError(result.error || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.log('🔐 Unexpected auth error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    }
  };

  const renderError = (field: keyof FormData) => {
    if (errors[field]) {
      return (
        <ThemedText style={styles.errorText}>
          {errors[field]}
        </ThemedText>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@assets/images/Landing.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <Animated.View 
        entering={FadeIn.duration(1000)}
        style={styles.content}
      >
        <View style={styles.innerContent}>
          <ThemedText type="title" style={styles.logo}>
            ECHO.
          </ThemedText>
          
          <ThemedText style={styles.subtitle}>
            let's get started.
          </ThemedText>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedInput
                placeholder="username"
                value={formData.username}
                onChangeText={(value) => handleInput('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, errors.username && styles.inputError]}
                editable={!isLoading}
              />
              {renderError('username')}
            </View>
            
            {!isLogin && (
              <View style={styles.inputContainer}>
                <ThemedInput
                  placeholder="email"
                  value={formData.email}
                  onChangeText={(value) => handleInput('email', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={[styles.input, errors.email && styles.inputError]}
                  editable={!isLoading}
                />
                {renderError('email')}
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <ThemedInput
                placeholder="password"
                value={formData.password}
                onChangeText={(value) => handleInput('password', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, errors.password && styles.inputError]}
                editable={!isLoading}
              />
              {renderError('password')}
            </View>
            
            {!isLogin && (
              <View style={styles.inputContainer}>
                <ThemedInput
                  placeholder="confirm password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInput('confirmPassword', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  editable={!isLoading}
                />
                {renderError('confirmPassword')}
              </View>
            )}
            
            {/* Auth Error Display */}
            {authError && (
              <View style={styles.authErrorContainer}>
                <ThemedText style={styles.authErrorText}>
                  {authError}
                </ThemedText>
              </View>
            )}
            
            <Pressable 
              onPress={handleSubmit} 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <ThemedText style={[styles.submitButtonText, { marginLeft: 8 }]}>
                    {isLogin ? 'LOGGING IN...' : 'REGISTERING...'}
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.submitButtonContainer}>
                  <ThemedText style={styles.submitButtonText}>
                    {isLogin ? 'LOG IN' : 'REGISTER'}
                  </ThemedText>
                  <ThemedText>→</ThemedText>
                </View>
              )}
            </Pressable>

            <Pressable 
              onPress={() => {
                console.log('Switching auth mode');
                setIsLogin(!isLogin);
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                });
                setErrors({});
                setAuthError(''); // Clear auth error when switching modes
              }}
              disabled={isLoading}
            >
              <View style={styles.switchTextContainer}>
                <ThemedText style={[styles.switchText, isLoading && styles.switchTextDisabled]}>
                  {isLogin ? 'do not have an account?' : 'have an existing account?'}
                </ThemedText>
                <View style={styles.submitButtonContainer}>
                  <ThemedText style={[styles.submitButtonText, {marginTop:5}]}>
                    {isLogin ? 'REGISTER' : 'LOGIN'}
                  </ThemedText>
                  <ThemedText>→</ThemedText>
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    fontSize: 43,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'AnonymousPro-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    fontFamily: 'AnonymousPro-Bold',
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    fontFamily: 'AnonymousPro-Bold',
    width: '75%',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontFamily: 'AnonymousPro-Bold',
    marginTop: 4,
    textAlign: 'center',
  },
  authErrorContainer: {
    width: '75%',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  authErrorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'AnonymousPro-Bold',
    textAlign: 'center',
    lineHeight: 18,
  },
  submitButtonContainer : {
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  submitButton: {
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
    textAlign: 'center',
    borderBottomWidth: 2, 
    borderBottomColor: 'black', 
    flexDirection: 'row'
  },
  switchTextContainer: {
    alignItems: 'center',
  },
  switchText: {
    marginTop: 20,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'AnonymousPro-Bold',
    textAlign: 'center',
    opacity: 0.8,
  },
  switchTextDisabled: {
    opacity: 0.5,
  },
  
}); 