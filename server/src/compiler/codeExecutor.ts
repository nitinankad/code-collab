import { exec } from 'child_process';
import CompilerConfig from '../config/compilerConfig';
import { generateUniqueFilename } from '../utils/randomFileName';

interface CodeExecutionResponse {
  output: string,
  error: string,
}

class CodeExecutor {
  getDockerCommand(language: string, source: string): string[] {
    const escapedSource = source.replace(/"/g, '\\"');
    const cppFile = generateUniqueFilename('source', 'cpp');
    const cppOutput = generateUniqueFilename('output', 'out');
    const javaFile = generateUniqueFilename('Main', 'java');

    const languageToCommand: { [language: string]: string[] } = {
      python: ['python', '-c', `"${escapedSource}"`],
      cpp: [
        'bash',
        '-c',
        `echo "${escapedSource}" > ${cppFile}`,
        `&& g++ -o ${cppOutput} ${cppFile}`,
        `&& ./${cppOutput}`,
        `&& rm ${cppFile} && rm ${cppOutput}`,
      ],
      java: [
        'bash',
        '-c',
        `echo "${escapedSource}" > ${javaFile}`,
        `&& javac ${javaFile} && java -cp . ${javaFile.replace('.java', '')}`,
        `&& rm ${javaFile} && rm ${javaFile.replace('.java', '.class')}`,
      ],
    };

    return languageToCommand[language];
  }

  async runDocker(language: string, source: string): Promise<[string, string]> {
    try {
      const imageName = CompilerConfig.getDockerImage(language);
      if (!imageName) throw new Error('Unsupported language');

      const command = this.getDockerCommand(language, source);
      const dockerCommand = ['docker', 'run', '--network', 'none', '--rm', imageName, ...command].join(' ');

      return new Promise((resolve, reject) => {
        exec(dockerCommand, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve([stdout, stderr]);
          }
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Docker execution failed: ${error.message}`);
      } else {
        throw new Error(`Docker execution failed: ${error}`);
      }
    }
  }

  async execute(language: string, source: string): Promise<CodeExecutionResponse> {
    try {
      const [stdout, stderr] = await this.runDocker(language, source);
      return {
        output: stdout,
        error: stderr
      }
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

export default CodeExecutor;
