/**
 * Color filter allows you to simulate colorblindness
 * @export
 * @class ColorFilter
 */
export class ColorFilter {
  /**
   *Creates an instance of ColorFilter.
   * @memberof ColorFilter
   */
  constructor() {
    if (null === document.getElementById('color__filter__svg')) {
      document.head.innerHTML += `<svg
      id="color__filter__svg" xmlns="http://www.w3.org/2000/svg"
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
    }
  }

  /**
   *
   *
   * @param {HTMLElement} element
   * @param {string} type
   * @memberof ColorFilter
   */
  applyFilter(element, type) {
    if (this.types[type]) {
      element.style.filter = `url(#color__filter__${type})`;
    } else {
      console.warn('A invalid filter was givin to the color filter');
    }
  }

  /**
   *
   *
   * @param {HTMLElement} element
   * @memberof ColorFilter
   */
  removeFilter(element) {
    element.style.filter = null;
  }

  /**
   *
   *
   * @readonly
   * @memberof ColorFilter
   */
  get types() {
    return {
      protanopia: 'protanopia',
      protanomaly: 'protanomaly',
      deuteranopia: 'deuteranopia',
      deuteranomaly: 'deuteranomaly',
      tritanopia: 'tritanopia',
      tritanomaly: 'tritanomaly',
      achromatopsia: 'achromatopsia',
      achromatomaly: 'achromatomaly'
    };
  }
}
