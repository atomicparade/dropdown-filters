/* eslint-disable max-classes-per-file */

export default class DropdownFilters {
  constructor(data, attributes, onStateChange) {
    this.data = data;
    this.attrs = attributes;
    this.onStateChange = onStateChange;
    this.handleStateChange = this.handleStateChange.bind(this);
    this.hideFilterPanels = this.hideFilterPanels.bind(this);
    this.getFilteredData = this.getFilteredData.bind(this);

    this.el = document.createElement('div');
    this.el.classList.add('dropdown-filters');

    this.filters = [];

    for (const attr of attributes) {
      let values = new Set();

      for (const row of data) {
        if (typeof row[attr] !== 'undefined') {
          values.add(row[attr]);
        }
      }

      values = Array.from(values).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      const filter = new Filter(this, attr, values, this.handleStateChange);
      this.filters.push(filter);
      this.el.append(filter.el);
    }

    window.addEventListener('click', () => {
      this.hideFilterPanels();
    });
  }

  handleStateChange() {
    this.onStateChange(this.getFilteredData());
  }

  hideFilterPanels() {
    for (const filter of this.filters) {
      filter.hideFilterPanel();
    }
  }

  getFilteredData(options) {
    let attrsToFilter = this.attrs;

    if (typeof options !== 'undefined') {
      if (typeof options.includeAttrs !== 'undefined') {
        attrsToFilter = attrsToFilter.filter((attr) => options.includeAttrs.includes(attr));
      } else if (typeof options.excludeAttrs !== 'undefined') {
        attrsToFilter = attrsToFilter.filter((attr) => !options.excludeAttrs.includes(attr));
      }
    }

    let data = this.data;

    for (const filter of this.filters) {
      if (attrsToFilter.includes(filter.attr)) {
        const selectedValues = filter.getSelectedValues();
        data = data.filter((row) => selectedValues.includes(row[filter.attr]));

        if (data.length === 0) {
          break;
        }
      }
    }

    return data;
  }
}

class Filter {
  constructor(parent, attr, values, onStateChange) {
    this.parent = parent;
    this.attr = attr;
    this.onStateChange = onStateChange;
    this.filterAvailableValues = this.filterAvailableValues.bind(this);
    this.getSelectedValues = this.getSelectedValues.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFilterButtonClick = this.handleFilterButtonClick.bind(this);
    this.handleFilterValueClick = this.handleFilterValueClick.bind(this);
    this.handleSearchInputClick = this.handleSearchInputClick.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.showFilterPanel = this.showFilterPanel.bind(this);
    this.hideFilterPanel = this.hideFilterPanel.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.selectNone = this.selectNone.bind(this);

    this.filterSearchInput = new FilterSearchInput(attr, this.handleSearchInputClick, this.filterAvailableValues);
    this.filterPanelButton = new FilterPanelButton(this.handleFilterButtonClick);

    this.btnSelectNone = document.createElement('button');
    this.btnSelectNone.classList.add('filter-control');
    this.btnSelectNone.appendChild(document.createTextNode('Select None'));
    this.btnSelectNone.addEventListener('click', this.selectNone);

    this.btnSelectAll = document.createElement('button');
    this.btnSelectAll.classList.add('filter-control');
    this.btnSelectAll.classList.add('filter-button-selected');
    this.btnSelectAll.appendChild(document.createTextNode('Select All'));
    this.btnSelectAll.addEventListener('click', this.selectAll);

    const filterControlContainer = document.createElement('div');
    filterControlContainer.classList.add('filter-control-container');
    filterControlContainer.appendChild(this.btnSelectNone);
    filterControlContainer.appendChild(this.btnSelectAll);

    const filterValueContainer = document.createElement('div');
    filterValueContainer.classList.add('filter-value-container');
    this.filterValues = [];
    for (const value of values) {
      const filterValue = new FilterValue(value, this.handleFilterValueClick);
      this.filterValues.push(filterValue);
      filterValueContainer.append(filterValue.el);
    }

    this.filterPanel = new FilterPanel();
    this.filterPanel.el.append(filterControlContainer);
    this.filterPanel.el.append(filterValueContainer);

    const filterPanelAligner = document.createElement('div'); // So that filter panel can be right-aligned
    filterPanelAligner.classList.add('filter-panel-aligner');
    filterPanelAligner.appendChild(this.filterPanelButton.el);
    filterPanelAligner.appendChild(this.filterPanel.el);

    this.el = document.createElement('div');
    this.el.classList.add('filter');
    this.el.classList.add(`filter-${this.attr.toLowerCase()}`);
    this.el.addEventListener('click', this.handleClick);
    this.el.appendChild(this.filterSearchInput.el);
    this.el.appendChild(filterPanelAligner);
  }

  filterAvailableValues() {
    // Make the value active if (and only if) filtering to it would result in at
    // at least one item returned, given the other active filters
    const items = this.parent.getFilteredData({ 'excludeAttrs': [ this.attr ] });

    for (const filterValue of this.filterValues) {
      const hypotheticalCount = items.filter((item) => item[this.attr] === filterValue.value).length;

      if (hypotheticalCount > 0) {
        filterValue.setActive();
      } else {
        filterValue.setInactive();
      }
    }

    // Highlight the value if (and only if) both of these conditions are true:
    // 1) The value is active
    // 2) The value matches the search query
    const trimmedQuery = this.filterSearchInput.el.value.trim();

    if (trimmedQuery === '') {
      // No need to set any to matching if there is nothing being searched
      for (const filterValue of this.filterValues) {
        filterValue.setDoesNotMatch();
      }
    } else {
      const queryParts = trimmedQuery.toLowerCase().match(/(\S+)/gu);

      for (const filterValue of this.filterValues) {
        if (!filterValue.isActive()) {
          filterValue.setDoesNotMatch();
          continue;
        }

        let filterValueMatches = true;

        for (const queryPart of queryParts) {
          if (!filterValue.valueLowerCase.includes(queryPart)) {
            filterValueMatches = false;
            break;
          }
        }

        if (filterValueMatches) {
          filterValue.setMatches();
        } else {
          filterValue.setDoesNotMatch();
        }
      }
    }
  }

  getSelectedValues() {
    return this.filterValues.
      filter((filterValue) => filterValue.isSelected()).
      map((filterValue) => filterValue.value);
  }

  handleClick(event) {
    event.stopPropagation();
  }

  handleFilterButtonClick() {
    if (this.filterPanel.isVisible()) {
      this.hideFilterPanel();
    } else {
      this.showFilterPanel();
    }
  }

  handleFilterValueClick(event, clickedFilterValue) {
    // If ctrl is held, only select/unselect this single value
    // Otherwise, unselect everything else and select this one
    if (event.ctrlKey) {
      if (clickedFilterValue.isSelected()) {
        clickedFilterValue.setUnselected();
      } else {
        clickedFilterValue.setSelected();
      }
    } else {
      for (const filterValue of this.filterValues) {
        filterValue.setUnselected();
      }

      clickedFilterValue.setSelected();
    }

    this.handleStateChange();
  }

  handleSearchInputClick() {
    this.showFilterPanel();
  }

  handleStateChange() {
    const totalValues = this.filterValues.length;
    const selectedValues = this.filterValues.filter((filterValue) => filterValue.isSelected()).length;

    if (totalValues === selectedValues) {
      this.filterPanelButton.setUnselected();
      this.btnSelectNone.classList.remove('filter-button-selected');
      this.btnSelectAll.classList.add('filter-button-selected');
    } else {
      this.filterPanelButton.setSelected();
      this.btnSelectAll.classList.remove('filter-button-selected');

      if (selectedValues === 0) {
        this.btnSelectNone.classList.add('filter-button-selected');
      } else {
        this.btnSelectNone.classList.remove('filter-button-selected');
      }
    }

    this.onStateChange();
  }

  showFilterPanel() {
    this.filterAvailableValues();
    this.parent.hideFilterPanels();
    this.filterPanel.show();
  }

  hideFilterPanel() {
    this.filterPanel.hide();
  }

  selectAll() {
    for (const filterValue of this.filterValues) {
      filterValue.setSelected();
    }

    this.handleStateChange();
  }

  selectNone() {
    for (const filterValue of this.filterValues) {
      filterValue.setUnselected();
    }

    this.handleStateChange();
  }
}

class FilterSearchInput {
  constructor(placeholder, onClick, onSearch) {
    this.onSearch = onSearch;
    this.onClick = onClick;
    this.handleClick = this.handleClick.bind(this);
    this.handleSearch = this.handleSearch.bind(this);

    this.el = document.createElement('input');
    this.el.classList.add('filter-search-input');
    this.el.type = 'text';
    this.el.placeholder = placeholder;
    this.el.addEventListener('click', this.handleClick);
    this.el.addEventListener('input', this.handleSearch);
  }

  handleClick() {
    this.onClick();
  }

  handleSearch() {
    this.onSearch();
  }
}

class FilterPanelButton {
  constructor(onClick) {
    this.onClick = onClick;
    this.handleClick = this.handleClick.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.setUnselected = this.setUnselected.bind(this);

    this.el = document.createElement('button');
    this.el.classList.add('filter-panel-button');
    this.el.appendChild(document.createTextNode('\u25bc'));
    this.el.addEventListener('click', this.handleClick);
  }

  handleClick() {
    this.onClick();
  }

  setSelected() {
    this.el.classList.add('filter-button-selected');
  }

  setUnselected() {
    this.el.classList.remove('filter-button-selected');
  }
}

class FilterPanel {
  constructor() {
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.isVisible = this.isVisible.bind(this);

    this.el = document.createElement('div');
    this.el.classList.add('filter-panel');
  }

  show() {
    this.el.classList.add('filter-panel-visible');
  }

  hide() {
    this.el.classList.remove('filter-panel-visible');
  }

  isVisible() {
    return this.el.classList.contains('filter-panel-visible');
  }
}

class FilterValue {
  constructor(value, onClick) {
    this.value = value;
    this.valueLowerCase = value.toLowerCase();
    this.onClick = onClick;
    this.handleClick = this.handleClick.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.setActive = this.setActive.bind(this);
    this.setInactive = this.setInactive.bind(this);
    this.setMatches = this.setMatches.bind(this);
    this.setDoesNotMatch = this.setDoesNotMatch.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.setUnselected = this.setUnselected.bind(this);

    this.el = document.createElement('button');
    this.el.classList.add('filter-value');
    this.el.classList.add('filter-button-selected');
    this.el.classList.add('filter-value-active');
    this.el.appendChild(document.createTextNode(value));
    this.el.addEventListener('click', this.handleClick);
    this._isSelected = true;
  }

  handleClick(event) {
    this.onClick(event, this);
  }

  isActive() {
    return this.el.classList.contains('filter-value-active');
  }

  isSelected() {
    return this._isSelected;
  }

  setActive() {
    this.el.classList.add('filter-value-active');
  }

  setInactive() {
    this.el.classList.remove('filter-value-active');
  }

  setMatches() {
    this.el.classList.add('filter-value-matches');
  }

  setDoesNotMatch() {
    this.el.classList.remove('filter-value-matches');
  }

  setSelected() {
    this._isSelected = true;
    this.el.classList.add('filter-button-selected');
  }

  setUnselected() {
    this._isSelected = false;
    this.el.classList.remove('filter-button-selected');
  }
}
