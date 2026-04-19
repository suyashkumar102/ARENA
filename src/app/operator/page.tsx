import CommandCentre from '@/components/operator/CommandCentre';
import AuthGuard from '@/components/operator/AuthGuard';

export default function OperatorPage() {
  return (
    <AuthGuard>
      <CommandCentre />
    </AuthGuard>
  );
}
