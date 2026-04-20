import { render, screen } from '@testing-library/react';
import PulseRing from '../src/components/shared/PulseRing';
import LiveBadge from '../src/components/shared/LiveBadge';
import ZoneLabel from '../src/components/shared/ZoneLabel';

describe('PulseRing', () => {
  test('renders with default props', () => {
    const { container } = render(<PulseRing />);
    expect(container.firstChild).toBeTruthy();
  });

  test('has aria-hidden for decorative use', () => {
    const { container } = render(<PulseRing />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  test('accepts size prop', () => {
    const { container } = render(<PulseRing size="lg" />);
    expect(container.firstChild).toBeTruthy();
  });
});

describe('LiveBadge', () => {
  test('renders default LIVE label', () => {
    render(<LiveBadge />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  test('renders custom label', () => {
    render(<LiveBadge label="ARENA" />);
    expect(screen.getByText('ARENA')).toBeInTheDocument();
  });

  test('has aria-label matching the label', () => {
    render(<LiveBadge label="LIVE" />);
    expect(screen.getByLabelText('LIVE')).toBeInTheDocument();
  });
});

describe('ZoneLabel', () => {
  test('renders label text', () => {
    render(<ZoneLabel status="clear" label="North Stand" />);
    expect(screen.getByText('North Stand')).toBeInTheDocument();
  });

  test('has correct aria-label with status', () => {
    render(<ZoneLabel status="critical" label="Gate A" />);
    expect(screen.getByLabelText('Gate A: critical')).toBeInTheDocument();
  });

  test('renders all status variants without error', () => {
    const statuses = ['clear', 'moderate', 'busy', 'critical'] as const;
    statuses.forEach(status => {
      const { unmount } = render(<ZoneLabel status={status} label="Test Zone" />);
      expect(screen.getByText('Test Zone')).toBeInTheDocument();
      unmount();
    });
  });
});
