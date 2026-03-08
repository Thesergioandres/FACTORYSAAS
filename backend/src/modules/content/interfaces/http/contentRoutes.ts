import { Router, type Request, type Response } from 'express';
import type { GenerateLandingContentUseCase } from '../../application/use-cases/GenerateLandingContentUseCase';

export function createContentRoutes({
  generateLandingContentUseCase
}: {
  generateLandingContentUseCase: GenerateLandingContentUseCase;
}) {
  const router = Router();

  router.get('/landing/:verticalId', async (req: Request, res: Response) => {
    const verticalId = req.params.verticalId || '';
    const result = await generateLandingContentUseCase.execute({ verticalId });
    if ('error' in result) {
      const statusCode = result.statusCode ?? 400;
      return res.status(statusCode).json({ message: result.error });
    }

    return res.json(result.content);
  });

  return router;
}
