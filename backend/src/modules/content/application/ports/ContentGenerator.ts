import type { ContentPayload } from '../../domain/entities/ContentPayload';

export interface ContentGenerator {
  generate(verticalId: string): Promise<ContentPayload>;
}
