import { Symkeys } from '@nejs/basic-extensions/classes'

export class MutableFunction extends Function {
  key = undefined;
  config = undefined;

  constructor(...params) {
    if (params.length < 2) {
      throw new Error(
        [
          'MutableFunction signature is (name, ...args, body):',
          'at least name and body are required!',
        ].join(' ')
      )
    }

    if (!globalThis[MutableFunction.fnKey]) {
      globalThis[MutableFunction.fnKey] = new Symkeys()
    }

    const name = params.slice(0, 1)[0]
    const args = params.slice(1, -1).flat()
    const argString = args.map((a) => `'${a}`).join(',')
    let body = params.slice(-1)[0]

    console.log(`argString: ${argString}`)

    if (typeof body === 'string') {
      body = new Function(
        `return (function(${argString}) { ${body} })(...arguments)`
      )
    }

    const keys = globalThis[MutableFunction.fnKey]
    const key = keys.add(`dynamic.function.${name}`)
    const config = { name, args, argString, body, key }
    const globalRef = MutableFunction.globalRef(key)

    const superString = [
      `(super(`,
      `${argString}, "`,
      `return ${globalRef}.body(...arguments)`,
      `"`,
      `))`,
    ].join('')

    eval(superString)

    this.config = config
    this.key = key
    keys[this.key] = this.config

    Object.defineProperty(this, 'name', {
      get() {
        return name
      },
      configurable: true,
      enumerable: false,
    })
  }

  get config() {
    return globalThis[MutableFunction.fnKey][this.key]
  }

  get globalRef() {
    return MutableFunction.globalRef(this.key)
  }

  invoke(...args) {
    return this.config.body(...args)
  }

  static genericFunctionBody(contents, argString = '') {
    return `return (function(${argString}) { ${contents} })(...arguments)`
  }

  static instanceFunctionBody(instanceKey, argString = '') {
    const ref = MutableFunction.globalRef(instanceKey, 'body')
  }

  static globalRef(functionKey, key = undefined) {
    const globalKey = `Symbol.for('${MutableFunction.fnKey.description}')`
    const fnKey = `Symbol.for('${functionKey.description}')`
    const propKey = key ? `[${key}]` : ''

    return `globalThis[${globalKey}][${fnKey}]${propKey}`
  }

  static globalVal(instanceKey) {
    return globalThis[MutableFunction.fnKey][instanceKey]
  }

  static get fnKey() {
    return Symbol.for('dynamic.function.fns')
  }
}
