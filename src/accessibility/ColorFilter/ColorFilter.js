import { isIE11 } from '../../debug';

/**
 * @typedef {'protanopia' | 'protanomaly'| 'deuteranopia' | 'deuteranomaly' | 'tritanopia' | 'tritanomaly' | 'achromatopsia'| 'achromatomaly' } filterType;
 */

/**
 * The Color filter allows you to simulate colorblindness.
 * @export
 * @class ColorFilter
 */
export class ColorFilter {
  /**
   * Creates an instance of ColorFilter.
   * @memberof ColorFilter
   * @param {HTMLElement} element target html element to apply the filter too
   * @param {filterType} type the
   */
  constructor(element = undefined, type = undefined) {
    if (isIE11) {
      console.error('Springroll ColorFilter is not supported on IE11');
      return;
    }
    this.element = null;
    if (null === document.getElementById('color__filter__svg')) {
      const div = document.createElement('div');

      div.style.width = '0';
      div.style.height = '0';
      div.style.position = 'absolute';
      div.style.opacity = '0';

      div.innerHTML += `<svg id="color__filter__svg" style="width: 0; height: 0; position: absolute;" xmlns="http://www.w3.org/2000/svg"
      version="1.1">
      <defs>
        <filter id="color__filter__protanopia">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.567, 0.433, 0,     0, 0
                    0.558, 0.442, 0,     0, 0
                    0,     0.242, 0.758, 0, 0
                    0,     0,     0,     1, 0"/>
        </filter>
        <filter id="color__filter__protanomaly">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.817, 0.183, 0,     0, 0
                    0.333, 0.667, 0,     0, 0
                    0,     0.125, 0.875, 0, 0
                    0,     0,     0,     1, 0"/>
        </filter>
        <filter id="color__filter__deuteranopia">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.625, 0.375, 0,   0, 0
                    0.7,   0.3,   0,   0, 0
                    0,     0.3,   0.7, 0, 0
                    0,     0,     0,   1, 0"/>
        </filter>
        <filter id="color__filter__deuteranomaly">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.8,   0.2,   0,     0, 0
                    0.258, 0.742, 0,     0, 0
                    0,     0.142, 0.858, 0, 0
                    0,     0,     0,     1, 0"/>
        </filter>
        <filter id="color__filter__tritanopia">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.95, 0.05,  0,     0, 0
                    0,    0.433, 0.567, 0, 0
                    0,    0.475, 0.525, 0, 0
                    0,    0,     0,     1, 0"/>
        </filter>
        <filter id="color__filter__tritanomaly">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.967, 0.033, 0,     0, 0
                    0,     0.733, 0.267, 0, 0
                    0,     0.183, 0.817, 0, 0
                    0,     0,     0,     1, 0"/>
        </filter>
        <filter id="color__filter__achromatopsia">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.299, 0.587, 0.114, 0, 0
                    0.299, 0.587, 0.114, 0, 0
                    0.299, 0.587, 0.114, 0, 0
                    0,     0,     0,     1, 0"/>
        </filter>
        <filter id="color__filter__achromatomaly">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.618, 0.320, 0.062, 0, 0
                    0.163, 0.775, 0.062, 0, 0
                    0.163, 0.320, 0.516, 0, 0
                    0,     0,     0,     1, 0"/>
        </filter>
      </defs>
      </svg>
      `;
      document.body.appendChild(div);
    }
    if (element instanceof HTMLElement && 'string' === typeof type) {
      this.applyFilter(element, type);
    }
  }

  /**
   * Applies the specified filter to the element.
   * @param {HTMLElement} element
   * @param {filterType} type
   * @memberof ColorFilter
   */
  applyFilter(element, type) {
    this.element = element;
    this.changeFilter(type);
  }

  /**
   * Changes the currently applied filter to the element if the color filter has it.
   * @param {filterType} type
   * @returns
   * @memberof ColorFilter
   */
  changeFilter(type) {
    if (null !== this.element) {
      this.element.style.filter = `url(#color__filter__${type})`;
    }
  }

  /**
   * Removes the filter from the element.
   * @memberof ColorFilter
   */
  removeFilter() {
    this.element.style.filter = null;
  }

  /**
   * Supported filter types.
   * @readonly
   * @memberof ColorFilter
   * @returns { object } Returns an object { name, value } with the colorblindness type:
   * (Protanopia, Protanomaly, Deuteranopia, Deuteranomaly, Tritanopia, Tritanomaly, Achromatopsia, Achromatomaly)
   */
  get types() {
    return [
      {
        name: 'Protanopia',
        value: 'protanopia'
      },
      {
        name: 'Protanomaly',
        value: 'protanomaly'
      },
      {
        name: 'Deuteranopia',
        value: 'deuteranopia'
      },
      {
        name: 'Deuteranomaly',
        value: 'deuteranomaly'
      },
      {
        name: 'Tritanopia',
        value: 'tritanopia'
      },
      {
        name: 'Tritanomaly',
        value: 'tritanomaly'
      },
      {
        name: 'Achromatopsia',
        value: 'achromatopsia'
      },
      {
        name: 'Achromatomaly',
        value: 'achromatomaly'
      }
    ];
  }
}
