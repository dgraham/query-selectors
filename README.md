# Optional querySelector

Use querySelector with an [Option][] return type rather than null.

[Option]: https://github.com/dgraham/option-type

## Usage

```js
import {querySelector} from 'query-selectors';

// Our favorite robot.
const url = 'https://github.com/hubot.png';

// This querySelector returns an Option<T>, never null.
const avatar = querySelector(document, '.avatar', HTMLImageElement);

// Test and unwrap the Option<HTMLImageElement>.
if (avatar.isSome()) {
  avatar.unwrap().src = url;
}

// Or operate on the element only if it was found as a Some<HTMLImageElement>.
avatar.map(el => el.src = url);
```

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
