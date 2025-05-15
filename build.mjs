import { rolldown } from 'rolldown'

const bundles = {
  esm: await rolldown({
    input: 'src/**/*.js',
    output: {
      dir: 'dist/@nejs',
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    }
  })
}
