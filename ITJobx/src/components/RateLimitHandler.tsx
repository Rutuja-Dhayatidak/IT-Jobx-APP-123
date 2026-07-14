import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";

interface RateLimitHandlerProps {
  onRetry: () => Promise<void>;
  children: React.ReactNode;
}

export const RateLimitHandler: React.FC<RateLimitHandlerProps> = ({ onRetry, children }) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Handle countdown logic
  useEffect(() => {
    if (retryAfterSeconds <= 0) {
      setIsBlocked(false);
      return;
    }

    setIsBlocked(true);
    const timer = setInterval(() => {
      setRetryAfterSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsBlocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfterSeconds]);

  /**
   * Helper function to parse Axios/Fetch response errors and trigger rate-limiting blocks.
   */
  const handleApiError = (error: any) => {
    if (error.response && error.response.status === 429) {
      // Extract retryAfter from custom JSON body or standard headers
      const serverRetryAfter = error.response.data?.retryAfter;
      const headerRetryAfter = error.response.headers ? parseInt(error.response.headers["retry-after"] || "0", 10) : 0;
      
      const secondsToWait = serverRetryAfter || headerRetryAfter || 60; // Default fallback to 60s
      setRetryAfterSeconds(secondsToWait);
      setIsBlocked(true);
      return true;
    }
    return false;
  };

  const handleManualRetry = async () => {
    setIsLoading(true);
    try {
      await onRetry();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRemainingTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  if (isBlocked) {
    return (
      <View style={styles.blockContainer}>
        <View style={styles.card}>
          <Text style={styles.emoji}>⏳</Text>
          <Text style={styles.title}>Too Many Attempts</Text>
          <Text style={styles.message}>
            You have sent too many requests. Please try again after{" "}
            <Text style={styles.highlight}>{formatRemainingTime(retryAfterSeconds)}</Text>.
          </Text>

          <TouchableOpacity
            style={[styles.retryButton, isLoading && styles.disabledButton]}
            onPress={handleManualRetry}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.retryButtonText}>Try Again</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Inject handleApiError callback context to children using React.cloneElement if needed,
  // or simply expose this as a wrapper component.
  return <>{children}</>;
};

const styles = StyleSheet.create({
  blockContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 20
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8
  },
  message: {
    fontSize: 15,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24
  },
  highlight: {
    color: "#DC3545",
    fontWeight: "bold"
  },
  retryButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center"
  },
  disabledButton: {
    backgroundColor: "#A0C4FF"
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
