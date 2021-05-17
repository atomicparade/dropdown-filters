import DropdownFilters from './dropdown-filters.js';

function createThemeSwitcher() {
  let useDarkStyle = true;
  const darkStyle = document.getElementById('darkStyle');

  const themeSwitcherButton = document.createElement('button');
  themeSwitcherButton.classList.add('theme-switcher-button');
  themeSwitcherButton.appendChild(document.createTextNode('Use light theme'));

  const handleThemeSwitcherClicked = (event) => {
    useDarkStyle = !useDarkStyle;

    if (useDarkStyle) {
      document.head.appendChild(darkStyle);
      themeSwitcherButton.removeChild(themeSwitcherButton.firstChild);
      themeSwitcherButton.appendChild(document.createTextNode('Use light theme'));
    } else {
      document.head.removeChild(darkStyle);
      themeSwitcherButton.removeChild(themeSwitcherButton.firstChild);
      themeSwitcherButton.appendChild(document.createTextNode('Use dark theme'));
    }

    event.stopPropagation(); // Prevent filter panels from closing
  };

  themeSwitcherButton.addEventListener('click', handleThemeSwitcherClicked);
  const themeSwitcher = document.getElementById('theme-switcher');
  themeSwitcher.appendChild(themeSwitcherButton);
}

function init() {
  const data = [
    { 'Size': 'Large', 'Attitude': 'Sleepy', 'Colour': 'Green', 'Animal': 'Rabbit' },
    { 'Size': 'Mini', 'Attitude': 'Suspicious', 'Colour': 'Orange', 'Animal': 'Cat' },
    { 'Size': 'Small', 'Attitude': 'Suspicious', 'Colour': 'Red', 'Animal': 'Rabbit' },
    { 'Size': 'Average-sized', 'Attitude': 'Playful', 'Colour': 'Red', 'Animal': 'Rabbit' },
    { 'Size': 'Large', 'Attitude': 'Jumping', 'Colour': 'Orange', 'Animal': 'Cat' },
    { 'Size': 'Average-sized', 'Attitude': 'Jumping', 'Colour': 'Red', 'Animal': 'Mouse' },
    { 'Size': 'Giant', 'Attitude': 'Sleepy', 'Colour': 'Yellow', 'Animal': 'Mouse' },
    { 'Size': 'Large', 'Attitude': 'Jumping', 'Colour': 'Violet', 'Animal': 'Rabbit' },
    { 'Size': 'Large', 'Attitude': 'Playful', 'Colour': 'Orange', 'Animal': 'Mouse' },
    { 'Size': 'Giant', 'Attitude': 'Playful', 'Colour': 'Indigo', 'Animal': 'Mouse' },
    { 'Size': 'Mini', 'Attitude': 'Sleepy', 'Colour': 'Blue', 'Animal': 'Mouse' },
    { 'Size': 'Average-sized', 'Attitude': 'Jumping', 'Colour': 'Red', 'Animal': 'Rabbit' },
    { 'Size': 'Mini', 'Attitude': 'Playful', 'Colour': 'Yellow', 'Animal': 'Cat' },
    { 'Size': 'Mini', 'Attitude': 'Lazy', 'Colour': 'Red', 'Animal': 'Cat' },
    { 'Size': 'Large', 'Attitude': 'Playful', 'Colour': 'Green', 'Animal': 'Mouse' },
    { 'Size': 'Small', 'Attitude': 'Jumping', 'Colour': 'Orange', 'Animal': 'Dog' },
    { 'Size': 'Average-sized', 'Attitude': 'Playful', 'Colour': 'Blue', 'Animal': 'Mouse' },
    { 'Size': 'Giant', 'Attitude': 'Playful', 'Colour': 'Green', 'Animal': 'Dog' },
    { 'Size': 'Large', 'Attitude': 'Playful', 'Colour': 'Indigo', 'Animal': 'Mouse' },
    { 'Size': 'Giant', 'Attitude': 'Suspicious', 'Colour': 'Violet', 'Animal': 'Mouse' },
  ];

  createThemeSwitcher();

  const updateContent = (matchingItems) => {
    const content = document.getElementById('content');

    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    for (const item of matchingItems) {
      const rowEl = document.createElement('span');

      rowEl.classList.add(`color-${item.Colour.toLowerCase()}`);
      rowEl.appendChild(document.createTextNode(`${item.Size} ${item.Attitude.toLowerCase()} ${item.Animal.toLowerCase()}`));

      content.appendChild(rowEl);
    }
  };

  const dropdownFilters = new DropdownFilters(data, [ 'Size', 'Attitude', 'Colour', 'Animal' ], updateContent);
  document.getElementById('dropdown-filters').append(dropdownFilters.el);
  updateContent(dropdownFilters.getFilteredData());
}

window.addEventListener('load', init);
