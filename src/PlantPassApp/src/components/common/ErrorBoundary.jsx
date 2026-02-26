import { Component } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * Error Boundary to catch and handle React errors gracefully
 * Prevents the entire app from crashing due to component errors
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Optionally reload the page if errors persist
    if (this.state.errorCount > 2) {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            background: 'linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              p: 4,
              textAlign: 'center',
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: 'error.main',
                mb: 2,
              }}
            />
            
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
              Please try again.
            </Typography>

            {this.state.errorCount > 1 && (
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                This error has occurred {this.state.errorCount} times. 
                If it continues, you&apos;ll be redirected to the home page.
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                size="large"
              >
                Try Again
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={() => window.location.href = '/'}
                size="large"
              >
                Go to Home
              </Button>
            </Box>

            {import.meta.env.DEV && this.state.error && (
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  textAlign: 'left',
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  <strong>Error Details (Development Only):</strong>
                  {'\n\n'}
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
