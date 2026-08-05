import { Component } from 'react';
import { ICONS } from '../../lib/icons';
import Icon from './Icon';

/**
 * Top-level render-error fallback. React error boundaries must be class
 * components — there is no hooks equivalent. Catches errors thrown during
 * render/lifecycle in the subtree below it and shows a recovery screen
 * instead of a blank white app, without touching any locally-stored data.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-3 px-8 bg-surface-variant">
        <div className="w-16 h-16 rounded-full bg-g-red-container grid place-items-center mb-1">
          <Icon svg={ICONS.warning} size={30} className="text-g-red-dark" />
        </div>
        <p className="font-display font-medium text-lg text-on-surface">Something went wrong</p>
        <p className="text-sm text-on-surface-tertiary max-w-xs">
          The app hit an unexpected error. Your saved data is untouched — reloading should fix it.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-g-blue text-white font-medium px-6 py-3 rounded-full min-h-11"
        >
          Reload app
        </button>
      </div>
    );
  }
}
