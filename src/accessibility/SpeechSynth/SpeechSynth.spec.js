import { SpeechSynth } from './SpeechSynth';

if (!window.speechSynthesis) {
  describe('SpeechSynth', () => {
    const s = new SpeechSynth();

    it('Should construct', () => {
      expect(s).to.be.not.undefined;
    });
  });
}
