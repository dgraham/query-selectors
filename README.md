# Optional querySelector

A querySelector function returning an [Option][] type rather than null.

[Option]: https://github.com/dgraham/option-type

## Usage

```js
import {querySelector} from 'query-selectors'

// Our favorite robot.
const url = 'https://github.com/hubot.png'

// This querySelector returns an Option<T>, never null.
const avatar = querySelector(document, '.avatar', HTMLImageElement)

// Test and unwrap the Option<HTMLImageElement>.
if (avatar.isSome()) {
  avatar.unwrap().src = url
}

// Or operate on the element only if it was found as a Some<HTMLImageElement>.
avatar.match({
  Some: (el) => el.src = url,
  None: () => console.log('not found')
})
```

## Standard element queries

Finding an individual element in the document tree and operating on it can
lead to null pointer exceptions.

```js
const el = document.querySelector('.expected-element')
// el may be null!
el.classList.add('selected')
el.setAttribute('title', 'hello')
```

A safer alternative is to guard against null values with a conditional statement.

```js
const el = document.querySelector('.expected-element')
if (el) {
  el.classList.add('selected')
  el.setAttribute('title', 'hello')
}
```

Because `querySelector` is so frequently used in web applications, and it's
tedious to guard every element query with null checks, these tests are most
often omitted and replaced with the hope that the element will exist on the page.

## Flow

Adding [Flow][] type annotations improves the reliability of our code at compile time
by forcing these null checks. When checked by Flow, the above example raises an error.

[Flow]: https://flow.org

```js
const el = document.querySelector('.expected-element')
el.classList.add('selected')
// Error: property `classList` Property cannot be accessed on possibly null value
```

So we'll have to test every query for a possible null result to satisfy the
type system.

Additionally, the `document.querySelector()` function returns an `HTMLElement`
base class, which means we cannot access subclass properties with a type cast.

If we want to access a method or attribute defined on an element subclass,
like HTMLImageElement's `src` or HTMLInputElement's `value`, Flow requires
another conditional test to assert that the element is actually
an `<img>` or `<input>`.

```js
const el = document.querySelector('.expected-element')
if (el) {
  el.value = 'hello'
  // Error: property `value` Property not found in HTMLElement
}
```

Adding an `instanceof` test passes the Flow type checker.

```js
const el = document.querySelector('.expected-element')
if (el instanceof HTMLInputElement) {
  el.value = 'hello'
}
```

The combination of null tests and subclass type refinements feels like we're
working against the type system, rather than with it, and like there's a
missing abstraction that could simplify things.

One solution is to combine Flow's type system with an option type.

## Option type

Several languages replace the concept of a null value with an [option type][].
An `Option` is either a `Some` or a `None`, but either way, it's an object
with methods and never null.

[option type]: https://en.wikipedia.org/wiki/Option_type

```js
import {Some} from 'option-type'
const option = Some(42)
option.isSome() // => true
option.isNone() // => false
option.unwrap() === 42 // => true
```

An `Option` is just a wrapper for a value with some interesting methods on it.
And when applied to selector queries, it prevents a `null` value from ever
entering our code.

```js
import {querySelector} from 'query-selectors'

const option = querySelector(document, '.expected-element')

if (option.isSome()) {
  const el = option.unwrap()
  el.classList.add('selected')
  el.setAttribute('title', 'hello')
}

if (option.isNone()) {
  console.log('element not found')
}
```

In this example, we still have conditional tests for the presence and absence
of the element in the tree, simply trading null tests for options.

Where `Option` gets more compelling is the ability to chain function calls onto
it. The functions evaluate only if the value is `Some`. When a `None`
appears, the function chain stops naturally without requiring any conditionals.

```js
import {querySelector} from 'query-selectors'
querySelector(document, '.expected-element')
  .andThen(addClass('selected')
  .andThen(setAttribute('title', 'hello')
```

## Element type filters

Returning to the `instanceof` type refinements required in the `<img>` and
`<input>` example, what we really want is a set of two filter criteria when
querying the document tree:

1. The selectors to find the element, as usual
2. An additional type filter to assert the element is an `<input>`

This is where the optional third argument to `querySelector` can be used.

```js
const option = querySelector(document, '.expected-element', HTMLInputElement)

if (option.isSome())
  option.unwrap().value = 'hello'
}
```

Both criteria must pass for a `Some` to be returned. The element must exist in
the page with the `expected-element` class name and it must be an
HTMLInputElement so that we can address the `value` property.

## Query functions

This library has two sets of functions: those that query the element tree and
those that operate on the returned `Option<Element>` values.

- `query(context, selector, klass)`
- `querySelector(context, selector, klass)`
- `querySelectorAll(context, selector, klass)`
- `closest(element, selector, klass)`

The `query` function is an easy way to begin using the library. It returns an
`Element`, rather than an `Option<Element>`, throwing an exception if it's
not found.

This can be used in place of the [`invariant`](https://github.com/zertosh/invariant)
assertion function commonly used in Flow projects.

```js
import {query} from 'query-selectors'
import invariant from 'invariant'

const el = query(document, '.selected', HTMLImageElement)

// is equivalent to

const el = document.querySelector('.selected')
invariant(el instanceof HTMLImageElement)
```

## DOM functions

Once we have an `Option<Element>` from a query, these functions can be
chained onto it with a call to `andThen`.

```js
querySelector(document, '.selected')
  .andThen(removeClass('selected', 'active'))
  .andThen(addClass('hidden', 'inactive'))
  .andthen(nextSibling('p'))
  .andThen(after('A text node'))
```

- `addClass(names)`
- `removeClass(names)`
- `toggleClass(name, force)`
- `find(selectors, klass)`
- `previousSibling(selectors, klass)`
- `nextSibling(selectors, klass)`
- `getAttribute(name)`
- `setAttribute(name, value)`
- `getValue()`
- `setValue(value)`
- `setText(value)`
- `append(nodes)`
- `prepend(nodes)`
- `after(nodes)`
- `before(nodes)`
- `replaceWith(nodes)`
- `remove()`
- `namedItem(name, klass)`

## Better with match syntax

The option type isn't without its drawbacks. After we query the tree and
have an `Option`, we need to extract its value with a `match` function to
operate on it.

```js
querySelector(document, '.expected-element').match({
  Some: (el) => {
    el.innerHTML = '<p>hello there</p>'
    el.classList.toggle('selected')
  },
  None: () => {
    console.log('not found')
  }
})
```

This uses two function closures which is slower to create and invoke than an
`if` or `switch` statement. It also precludes using early `return` statements
because they're wrapped in their own functions.

Languages with a native option type pair it with pattern matching—a control
flow construct, like `if` and `switch`, but with the ability to destructure
a value into its constituent parts.

The [Pattern Matching Syntax][match] proposal for JavaScript would make working
with option types even better.

[match]: https://github.com/tc39/proposal-pattern-matching

The `match` function invocation above would become something like this.

```js
match querySelector(document, '.expected-element') {
  Some(el): {
    el.innerHTML = '<p>hello there</p>'
    el.classList.toggle('selected')
  },
  None: {
    console.log('not found')
  }
})
```

The proposed `match` keyword avoids the closures and function calls
required today.

## Alternatives

The [Optional Chaining Operator][op] proposal is another way to improve null
checks. It's an addition to JavaScript's syntax that would alleviate the need
for many of the conditional tests resulting from `document.querySelector()`.

```js
const el = document.querySelector('.expected-element')
el?.classList.add('selected')
el?.setAttribute('title', 'hello')
```

[op]: https://github.com/tc39/proposal-optional-chaining

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
