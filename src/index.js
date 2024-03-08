import { Extension, Patch } from '@nejs/extension';
import { Controls } from '@nejs/basic-extensions';

Patch.enableAll();

import { Deferred } from "./async/deferred.js";

import { JWT } from './auth/jwt.js';

import { DatabaseDialect } from './database/DatabaseDialect.js';
import { SnowflakeDialect } from './database/dialects/SnowflakeDialect.js';
import { SGQLArgParser } from './database/SGQLArgParser.js';
import { SGQLArgParserConfig } from './database/SGQLArgParserConfig.js';
import { SGQLArgParserContext } from './database/SGQLArgParserContext.js';

import { Range } from "./core/range.js";
import { Singleton } from './core/singleton.js';

import { Tags } from './strings/tags.js';

import { Hasher } from './util/hasher.js';
import { SemVer } from './util/semver.js';

export const classes = {
  Deferred, JWT, DatabaseDialect, SnowflakeDialect,
  SGQLArgParser, SGQLArgParserConfig, SGQLArgParserContext,
  Range, Singleton, Tags, Hasher, SemVer
};

export const extensions = {
  ...classes.reduce((acc,klass) => ({ [Patch.extractName(klass)]: new Extension(klass) })),
}

export const manifest = {
  classes,
};

export default manifest;