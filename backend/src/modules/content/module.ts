import { ContentService } from './infrastructure/ContentService';
import { GenerateLandingContentUseCase } from './application/use-cases/GenerateLandingContentUseCase';
import { createContentRoutes } from './interfaces/http/contentRoutes';

export function createContentModule() {
  const contentService = new ContentService();
  const generateLandingContentUseCase = new GenerateLandingContentUseCase(contentService);
  const contentRoutes = createContentRoutes({ generateLandingContentUseCase });

  return { contentRoutes };
}
