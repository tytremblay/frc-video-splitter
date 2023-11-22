import { config } from 'dotenv';
import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { EnvironmentPlugin } from 'webpack';

const dotenv = config({ path: '.env.dev' });

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new EnvironmentPlugin({
    FLUENTFFMPEG_COV: false,
    TBA_KEY: JSON.stringify(dotenv.parsed?.TBA_KEY ?? process.env.TBA_KEY),
  }),
];
