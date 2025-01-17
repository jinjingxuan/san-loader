import qs from 'qs';
import path from 'path';

import hash from 'hash-sum';
import { getOptions, stringifyRequest } from 'loader-utils';
import { parseSFC } from 'san-sfc-compiler';

import { Options } from './';
import generateTemplateImport from './gencode/template';
import generateStyleImport from './gencode/style';
import generateScriptImport from './gencode/script';
import transformTemplate from './transform/template';
import transformStyle from './transform/style';
import { getDescriptor, setDescriptor } from './utils';

const defaultOptions: Options = {
  compileANode: false,
};

export default function (source) {
  const userOptions = getOptions(this);
  const options: Options = { ...defaultOptions, ...userOptions };

  const filename = this.resourcePath;
  const sourceRoot = this.context || process.cwd();
  const rawQuery = this.resourceQuery.slice(1);
  const query = qs.parse(rawQuery);

  if (query && 'san' in query) {
    const descriptor = getDescriptor(filename);
    let result = { code: '', map: {} };

    if (query.type === 'template') {
      const hasScoped = descriptor!.styles.some((s) => s.scoped);
      result = transformTemplate(
        descriptor?.template!,
        rawQuery,
        filename,
        options,
        query,
        hasScoped
      );
    } else if (query.type === 'style') {
      result = transformStyle(
        descriptor?.styles!,
        rawQuery,
        filename,
        options,
        query
      );
    } else {
      result = {
        code: descriptor?.script!.content!,
        map: descriptor?.script?.map,
      };
    }
    if (this.sourceMap) {
      this.callback(null, result.code, result.map);
    } else {
      this.callback(null, result.code);
    }
  } else {
    const shortFilePath = path
      .relative(sourceRoot, filename)
      .replace(/^(\.\.[\/\\])+/, '')
      .replace(/\\/g, '/');
    const scopeId = hash(shortFilePath);

    const descriptor = parseSFC({
      source,
      filename,
      sourceRoot,
      needMap: true,
    });

    setDescriptor(filename, descriptor);

    // 生成入口文件
    const templateImport = generateTemplateImport(descriptor, scopeId, options);
    const stylesImport = generateStyleImport(descriptor, scopeId, options);
    const scriptImport = generateScriptImport(descriptor, scopeId, options);

    const normalizePath = stringifyRequest(
      this,
      require.resolve('./normalize.js')
    );

    const importStr = `import normalize from ${normalizePath};`;
    const exportStr = 'export default normalize(script, template, $style);';

    const output = [
      importStr,
      scriptImport,
      templateImport,
      stylesImport,
      exportStr,
      '/* san-hmr component */',
    ];

    this.callback(null, output.join('\n'));
  }
}
