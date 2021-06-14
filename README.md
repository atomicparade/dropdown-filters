# dropdown-filters

[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://choosealicense.com/licenses/mit/)

JavaScript module for creating dropdown filters. Filters can be styled with
CSS.

Demo available [here](https://atomicparade.github.io/dropdown-filters/).

## Usage

Instantiate `DropdownFilters` with the parameters `data`, `attributes`, and
`onStateChange`.

- `data` should be an array of objects, and each object should contain a set of
    keys and values.
- `attributes` should be an array of keys. A filter will be created for each
    key in `attributes`.
- `onStateChange` should be a function that accepts an array. The array will
    contain a subset of `data`.

The instance will have a child, `el`, which is an `HTMLElement` that should be
added to the document. This is the parent element for all of the filters.

## Example

```js
const data = [
  {
    'Size': 'Large'
    , 'Attitude': 'Sleepy'
    , 'Colour': 'Green'
    , 'Animal': 'Rabbit'
  },
  {
    'Size': 'Mini',
    , 'Attitude': 'Suspicious',
    , 'Colour': 'Orange',
    , 'Animal': 'Cat' 
  },
  { 
    'Size': 'Average-sized',
    , 'Attitude': 'Jumping',
    , 'Colour': 'Red'
    , 'Animal': 'Mouse' 
  },
];

const callback = (matchingItems) => {
  console.log(matchingItems);
}

const dropdownFilters = new DropdownFilters(
  data
  , [ 'Size', 'Attitude', 'Colour', 'Animal' ]
  , callback
);

document.body.append(dropdownFilters.el);
```
