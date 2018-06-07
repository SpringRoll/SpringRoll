import { SavedData } from './SavedData';

const SD = new SavedData();

describe('SavedData', () => {
  it('Should be able to read and write data to storage', () => {
    const test = { foo: 'bar' };
    SD.write('test', test);
    expect(SD.read('test')).to.deep.equal(test);
  });

  it('Should be able to remove data from storage', () => {
    expect(SD.read('test')).to.be.not.undefined;

    SD.remove('test');

    expect(SD.read('test')).to.be.null;
  });

  it('Should be able to read/write to a cookie', () => {
    SD.WEB_STORAGE_SUPPORT = false;

    const test = { foo: 'bar' };
    SD.write('test', test);
    expect(SD.read('test')).to.deep.equal(test);

    expect(SD.read('test')).to.be.not.undefined;

    SD.remove('test');

    expect(SD.read('test')).to.be.empty.string;
  });
});
