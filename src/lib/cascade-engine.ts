import { CascadeAction, Cascade } from '@/types/arena.types';
import { adminDb } from './firebase-admin';

export async function executeCascadeAction(action: CascadeAction, eventId: string): Promise<CascadeAction> {
  const updatedAction: CascadeAction = { ...action, status: 'executing', executedAt: Date.now() };
  
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }
    
    // Simulate action execution delay and update in Firebase
    // In reality this might hit external APIs or IoT systems
    
    const actionRef = adminDb.ref(`arena/${eventId}/actions/${action.id}`);
    await actionRef.set(updatedAction);

    // Simulate success
    updatedAction.status = 'done';
    await actionRef.update({ status: 'done' });
    
    return updatedAction;
  } catch (error) {
    console.error(`Failed to execute cascade action ${action.id}:`, error);
    updatedAction.status = 'failed';
    return updatedAction;
  }
}

export async function executeCascadeSequence(cascade: Cascade, eventId: string): Promise<Cascade> {
  const updatedCascade = { ...cascade, lastFiredAt: Date.now(), actions: [...cascade.actions] };
  
  for (let i = 0; i < updatedCascade.actions.length; i++) {
    const action = updatedCascade.actions[i];
    updatedCascade.actions[i] = await executeCascadeAction(action, eventId);
  }
  
  return updatedCascade;
}
