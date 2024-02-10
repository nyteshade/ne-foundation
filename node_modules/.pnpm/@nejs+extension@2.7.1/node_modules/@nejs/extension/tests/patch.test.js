const { afterEach } = require('node:test');
const {
  Patch,
} = require('../dist/cjs/index.js');

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  reject = null
  resolve = null
  promise = null
}

describe('Patch Class Tests', () => {
  let owner;
  let patch;
  let patch2;
  let patch3;

  let mockOwner;
  let mockPatches;

  beforeEach(() => {
    owner = {};
    mockOwner = { originalProp: 'originalValue' };
    mockPatches = { patchedProp: 'patchedValue', originalProp: 'newPatchedValue' };

    patch = new Patch(mockOwner, mockPatches);
    patch2 = new Patch(owner, { prop1: 'patched1' });
    patch3 = new Patch(owner, { prop2: 'patched2' });
  });

  afterEach(() => {
    patch?.release()
    patch2?.release()
    patch3?.release()
  })

  describe('Constructor', () => {
    it('should correctly initialize a Patch instance', () => {
      expect(patch.owner).toBe(mockOwner);
      expect(patch.patchConflicts).toHaveProperty('originalProp');
      expect(patch.patchEntries).toHaveProperty('patchedProp');
      expect(patch.patchEntries).toHaveProperty('originalProp');
    });
  });

  describe('apply method', () => {
    it('should apply all patches to the owner object', () => {
      patch.apply();
      expect(mockOwner.patchedProp).toBe(mockPatches.patchedProp);
      expect(mockOwner.originalProp).toBe(mockPatches.originalProp);
    });

    it('should set applied flag to true after applying patches', () => {
      patch.apply();
      expect(patch.applied).toBeTruthy();
    });
  });

  describe('conditionalPatch', () => {
    it('should allow a global condition', async () => {
      const owner = {}
      const then = Date.now()
      const deferred = new Deferred()
      const conditionalPatch = new Patch(owner, {prop: 'value'}, {
        condition() { return (Date.now() - then) >= 100 }
      })

      try {
        conditionalPatch.apply()
        expect(conditionalPatch.patchEntries.prop.condition).toBeTruthy()
        expect(Reflect.has(owner, 'prop')).toBeFalsy()

        setTimeout(() => deferred.resolve(true), 100)
        await deferred.promise

        conditionalPatch.apply()
        expect(Reflect.has(owner, 'prop')).toBeTruthy()
      }
      finally {
        conditionalPatch.revert()
      }
    })

    it('should allow for a patch specific condition', async () => {
      const owner = {}
      const then = Date.now()
      const deferred = new Deferred()
      const conditionalPatch = new Patch(owner, {prop: 'value', prop2: true}, {
        conditions: {
          prop2() { return (Date.now() - then) >= 100 }
        }
      })

      try {
        conditionalPatch.apply()
        expect(conditionalPatch.patchEntries.prop?.condition).toBeFalsy()
        expect(conditionalPatch.patchEntries.prop2.condition).toBeTruthy()
        expect(Reflect.has(owner, 'prop')).toBeTruthy()
        expect(Reflect.has(owner, 'prop2')).toBeFalsy()

        setTimeout(() => deferred.resolve(true), 100)
        await deferred.promise

        conditionalPatch.apply()
        expect(Reflect.has(owner, 'prop2')).toBeTruthy()
      }
      finally {
        conditionalPatch.revert()
      }
    })

    it('should allow for a patch specific condition with global fallback', async () => {
      const owner = {}
      const then = Date.now()
      const deferred = new Deferred()
      const deferred2 = new Deferred()
      const conditionalPatch = new Patch(owner, {prop: 'value', prop2: true}, {
        condition() {
          return (Date.now() - then) >= 200
        },
        conditions: {
          prop2() { return (Date.now() - then) >= 100 }
        }
      })

      try {
        conditionalPatch.apply()
        expect(conditionalPatch.patchEntries.prop?.condition).toBeTruthy()
        expect(conditionalPatch.patchEntries.prop2.condition).toBeTruthy()
        expect(Reflect.has(owner, 'prop')).toBeFalsy()
        expect(Reflect.has(owner, 'prop2')).toBeFalsy()

        setTimeout(() => deferred.resolve(true), 100)
        await deferred.promise

        conditionalPatch.apply()
        expect(Reflect.has(owner, 'prop')).toBeFalsy()
        expect(Reflect.has(owner, 'prop2')).toBeTruthy()

        setTimeout(() => deferred2.resolve(true), 200)
        await deferred2.promise
        conditionalPatch.apply()
        expect(Reflect.has(owner, 'prop')).toBeTruthy()
        expect(Reflect.has(owner, 'prop2')).toBeTruthy()
      }
      finally {
        conditionalPatch.revert()
      }
    })
  })

  describe('revert method', () => {
    it('should revert all patches and restore original properties', () => {
      patch.apply();
      patch.revert();
      expect(mockOwner.originalProp).toBe('originalValue');
      expect(mockOwner).not.toHaveProperty('patchedProp');
    });

    it('should set applied flag to false after reverting patches', () => {
      patch.apply();
      patch.revert();
      expect(patch.applied).toBeFalsy();
    });
  });

  describe('entries getter', () => {
    it('should return all patch entries', () => {
      const entries = patch.entries;
      expect(entries.length).toBe(Object.keys(mockPatches).length);
      expect(entries).toEqual(expect.arrayContaining([
        expect.arrayContaining(['patchedProp', expect.anything()]),
        expect.arrayContaining(['originalProp', expect.anything()])
      ]));
    });
  });

  describe('patches getter', () => {
    it('should return patches by key', () => {
      const patches = patch.patches;
      expect(patches.patchedProp).toBeTruthy()
      expect(patches.originalProp).toBeTruthy()
    })
  })

  describe('conflicts getter', () => {
    it('should return all conflict entries', () => {
      const conflicts = patch.conflicts;
      expect(conflicts.length).toBe(1);
      expect(conflicts).toEqual(expect.arrayContaining([
        expect.arrayContaining(['originalProp', expect.anything()])
      ]));
    });
  });

  describe('enableFor method', () => {
    it('should apply all patches for a given owner', () => {
      Patch.enableFor(owner);
      expect(owner.prop1).toBe('patched1');
      expect(owner.prop2).toBe('patched2');
    });
  });

  describe('should be iterable', () => {
    it('should allow iteration via for loop', () => {
      patch.apply();

      const knownKeys = ['originalProp', 'patchedProp'];

      for (let [key, value] of patch) {
        expect(knownKeys.some(k => k === key))
      }

      patch.revert();
    })

    it('should be convertible to an array', () => {
      patch.apply() ;

      const entries = Array.from(patch);

      expect(entries[0][0]).toMatch(/originalProp|patchedProp/)
      expect(entries[1][0]).toMatch(/originalProp|patchedProp/)
    })
  })

  describe('disableFor method', () => {
    it('should revert all patches for a given owner', () => {
      Patch.enableFor(owner);
      Patch.disableFor(owner);
      expect(owner).not.toHaveProperty('prop1');
      expect(owner).not.toHaveProperty('prop2');
    });
  });
});
