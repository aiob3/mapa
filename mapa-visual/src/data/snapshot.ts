import snapshotRaw from './architecture-snapshot.generated.json';
import type { ArchitectureSnapshotV1 } from '@/types/architecture';

export const snapshot = snapshotRaw as ArchitectureSnapshotV1;
