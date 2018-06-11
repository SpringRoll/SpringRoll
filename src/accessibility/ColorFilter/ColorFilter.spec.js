import { ColorFilter } from './ColorFilter';

describe('ColorFilter', () => {
  it('Should append the svg to the head once', () => {
    new ColorFilter();
    const count = document.head.childElementCount;
    new ColorFilter();

    expect(document.head.childElementCount).to.equal(count);
  });

  it('Should apply filter to any element and remove it as well', () => {
    const cf = new ColorFilter();
    expect(document.body.style.filter).to.equal('');

    cf.applyFilter(document.body, 'protanopia');

    expect(document.body.style.filter).to.equal(
      'url("#color__filter__protanopia")'
    );

    cf.removeFilter(document.body);

    expect(document.body.style.filter).to.equal('');
  });
});
