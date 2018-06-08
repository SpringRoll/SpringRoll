import { SpeechSynth } from './SpeechSynth';

describe('SpeechSynth', () => {
  const s = new SpeechSynth();

  it('Should construct', () => {
    expect(s).to.be.not.undefined;
  });
});
