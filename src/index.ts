import { TemplateCompileOptions, StyleCompileOptions } from 'san-sfc-compiler';

import SanLoader from './loader';
import SanLoaderPlugin from './plugin';

interface Options {
  esModule?: boolean;
  compileANode?: boolean;
  templateCompileOptions?: TemplateCompileOptions;
  styleCompileOptions?: StyleCompileOptions;
}

export { SanLoaderPlugin, Options };

export default SanLoader;
