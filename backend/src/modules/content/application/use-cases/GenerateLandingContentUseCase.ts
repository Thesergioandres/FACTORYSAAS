import type { ContentGenerator } from '../ports/ContentGenerator';

export class GenerateLandingContentUseCase {
  constructor(private readonly generator: ContentGenerator) {}

  async execute(input: { verticalId: string }) {
    if (!input.verticalId) {
      return { error: 'verticalId requerido', statusCode: 400 } as const;
    }

    const content = await this.generator.generate(input.verticalId);
    return { content } as const;
  }
}
