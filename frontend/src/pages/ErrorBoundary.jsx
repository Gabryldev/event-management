import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error Boundary:", error);
    console.error(info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <pre style={{ padding: 20 }}>
          {String(this.state.error)}
        </pre>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

