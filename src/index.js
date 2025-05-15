import { Extension, Patch } from "@nejs/extension";
import { Controls } from "@nejs/basic-extensions";

Patch.enableAll();

import { Deferred } from "./async/deferred.js";

import { Callable } from "./core/callable.js";
import { Range } from "./core/range.js";
import { Singleton } from "./core/singleton.js";

import { Tags } from "./strings/tags.js";

import { Hasher } from "./util/hasher.js";
import { SemVer } from "./util/semver.js";

export const classes = {
  Deferred,
  Callable,
  Range,
  Singleton,
  Tags,
  Hasher,
  SemVer,
};

export const extensions = {
  ...Object.values(classes).reduce((_, klass) => {
    if (klass && klass != null) {
      return {
        [Patch.extractName(klass)]: new Extension(klass),
      };
    }
  }),
};

export const manifest = { classes };

export default manifest;
