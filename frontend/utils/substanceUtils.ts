import { Substance, SubstanceRoa } from '../types';

export const getDurationTotalMinutes = (substance: Substance, roaName: string): number => {
  const roa = substance.roas.find(r => r.name === roaName);
  if (!roa || !roa.duration || !roa.duration.total) return 240; // Default 4 hours

  const { max, units } = roa.duration.total;
  if (units === 'hours') return max * 60;
  if (units === 'minutes') return max;
  return 240;
};

export const getActiveLogs = (logs: any[], substances: Record<string, Substance>) => {
  const now = Date.now();
  return logs.filter(log => {
    // If we have substance data, use it, otherwise default 4 hours
    const duration = 240; // simplified for now if data missing
    // Ideally we need the substance data for every log to know duration
    // For MVP, we might assume 4-6 hours or fetch it.
    
    // Better approach: Store duration in the log at creation time? 
    // Yes, let's store 'estimatedDurationMinutes' in the log.
    const logDuration = log.estimatedDurationMinutes || 240;
    return (log.timestamp + logDuration * 60 * 1000) > now;
  });
};
