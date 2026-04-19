import { render, screen } from '@testing-library/react';
import ActionCard from '../src/components/fan/ActionCard';
import { useMatchState } from '../src/hooks/useMatchState';
import { useFirebaseZones } from '../src/hooks/useFirebaseZones';

// Mock hooks
jest.mock('../src/hooks/useMatchState', () => ({
  useMatchState: jest.fn()
}));
jest.mock('../src/hooks/useFirebaseZones', () => ({
  useFirebaseZones: jest.fn()
}));

const mockZones = {
  'concession-n1': { id: 'concession-n1', name: 'North Food', queueMinutes: 2 }
};

describe('ActionCard', () => {
  test('renders GO NOW when status is clear and tension is low', () => {
    (useMatchState as jest.Mock).mockReturnValue({ tensionIndex: 50, phase: 'middle-overs', over: 10 });
    (useFirebaseZones as jest.Mock).mockReturnValue(mockZones);
    
    render(<ActionCard />);
    expect(screen.getByText('GO NOW')).toBeInTheDocument();
  });

  test('renders STAY when tensionIndex > 80', () => {
    (useMatchState as jest.Mock).mockReturnValue({ tensionIndex: 85, phase: 'middle-overs', over: 10 });
    (useFirebaseZones as jest.Mock).mockReturnValue(mockZones);
    
    render(<ActionCard />);
    expect(screen.getByText('STAY')).toBeInTheDocument();
  });

  test('renders WAIT when queue is high', () => {
    (useMatchState as jest.Mock).mockReturnValue({ tensionIndex: 50, phase: 'middle-overs', over: 10 });
    (useFirebaseZones as jest.Mock).mockReturnValue({
      'concession-n1': { id: 'concession-n1', name: 'North Food', queueMinutes: 10 }
    });
    
    render(<ActionCard />);
    expect(screen.getByText('WAIT 6 MINS')).toBeInTheDocument();
  });
});
