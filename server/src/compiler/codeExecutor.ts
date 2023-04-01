import { exec } from 'child_process';
import CompilerConfig from '../config/compilerConfig';
import { generateUniqueFilename } from '../utils/randomFileName';

interface CodeExecutionResponse {
  output: string,
  error: string,
}

class CodeExecutor {
  getDockerCommand(language: string, source: string): string[] {
    const uniqueCppSource = generateUniqueFilename('source', 'cpp');
    const uniqueCppOutput = generateUniqueFilename('output', 'out');
    const uniqueJavaFile = generateUniqueFilename('Main', 'java');

    const languageToCommand: { [language: string]: string[] } = {
      python: ['python', '-c', source],
      cpp: [
        'bash',
        '-c',
        `echo "${source.replace(/"/g, '\\"')}" > ${uniqueCppSource}`,
        `&& g++ -o ${uniqueCppOutput} ${uniqueCppSource}`,
        `&& ./${uniqueCppOutput}`,
        `&& rm ${uniqueCppSource} && rm ${uniqueCppOutput}`,
      ],
      java: [
        'bash',
        '-c',
        `echo "${source.replace(/"/g, '\\"')}" > ${uniqueJavaFile}`,
        `&& javac ${uniqueJavaFile} && java -cp . ${uniqueJavaFile.replace('.java', '')}`,
        `&& rm ${uniqueJavaFile} && rm ${uniqueJavaFile.replace('.java', '.class')}`,
      ],
    };

    return languageToCommand[language];
  }

  async runDocker(language: string, source: string): Promise<[string, string]> {
    const imageName = CompilerConfig.getDockerImage(language);
    if (!imageName) throw new Error('Unsupported language');

    const command = this.getDockerCommand(language, source);
    const dockerCommand = ['docker', 'run', '--rm', imageName, ...command].join(' ');

    return new Promise((resolve, reject) => {
      exec(dockerCommand, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve([stdout, stderr]);
        }
      });
    });
  }

  async execute(language: string, source: string): Promise<CodeExecutionResponse> {
    const [stdout, stderr] = await this.runDocker(language, source);

    return {
      output: stdout,
      error: stderr
    }
  }
}

export default CodeExecutor;
