import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, LoginFormValues } from "../utils/validation.helper";

interface LoginFormProps {
  onSubmitSuccess: (data: any) => void;
  onLoginApiCall: (credentials: LoginFormValues) => Promise<any>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmitSuccess, onLoginApiCall }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await onLoginApiCall(data);
      onSubmitSuccess(response);
    } catch (error: any) {
      // Map API validation errors directly to fields
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err: { field: string; message: string }) => {
          // e.g. mapping "email" to the email input field
          if (err.field === "email" || err.field === "password") {
            setError(err.field as keyof LoginFormValues, {
              type: "server",
              message: err.message
            });
          }
        });
      } else {
        // Fallback for general authentication failure
        setError("email", {
          type: "server",
          message: error.message || "Invalid email or password"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={254}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting}
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={128}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                <Text style={styles.toggleText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: "100%"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },
  inputContainer: {
    marginBottom: 15
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff"
  },
  inputError: {
    borderColor: "red"
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center"
  },
  passwordInput: {
    paddingRight: 60
  },
  toggleButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center"
  },
  toggleText: {
    color: "#007BFF",
    fontWeight: "bold"
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },
  buttonDisabled: {
    backgroundColor: "#A0C4FF"
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
