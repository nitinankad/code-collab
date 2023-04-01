import { Request, Response, NextFunction } from 'express';

class CompilerConfig {
  private static readonly imageMappings: { [language: string]: string } = {
    python: 'python:3.9-alpine',
    cpp: 'gcc:10',
    java: 'openjdk:17',
  };

  static getDockerImage(language: string): string | null {
    const image: string = this.imageMappings[language];
    return image ?? null;
  }

  static validateLanguage(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | void {
    const language = req.body.language;
    if (!CompilerConfig.getDockerImage(language)) {
      return res.status(400).json({ error: 'Unsupported language' });
    }
    next();
  }
}

export default CompilerConfig;
