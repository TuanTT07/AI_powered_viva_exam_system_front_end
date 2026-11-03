/* global AudioWorkletProcessor, registerProcessor, sampleRate */
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frame = new Int16Array(800);
    this.used = 0;
    this.buffer = new Float32Array(16);
    this.position = 16;
    this.port.onmessage = ({ data }) => {
      if (data === "flush") {
        this.stopped = true;
        if (sampleRate !== 16000) {
          const tail = new Float32Array(this.buffer.length + 16);
          tail.set(this.buffer);
          this.resample(tail, this.buffer.length);
        }
        if (this.used) this.postFrame();
        this.port.postMessage("flushed");
      }
    };
  }
  postFrame() {
    const buffer = new ArrayBuffer(this.used * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < this.used; i++)
      view.setInt16(i * 2, this.frame[i], true);
    this.port.postMessage(buffer, [buffer]);
    this.used = 0;
  }
  emit(value) {
    const v = Math.max(-1, Math.min(1, value));
    this.frame[this.used++] = Math.round(v * (v < 0 ? 32768 : 32767));
    if (this.used === this.frame.length) this.postFrame();
  }
  resample(joined, end) {
    const step = sampleRate / 16000,
      cutoff = Math.min(1, 16000 / sampleRate) * 0.9;
    while (this.position < end) {
      const center = Math.floor(this.position);
      let value = 0,
        weightSum = 0;
      for (let offset = -15; offset <= 16; offset++) {
        const distance = center + offset - this.position;
        const x = Math.PI * distance * cutoff;
        const sinc = Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x;
        const weight =
          cutoff * sinc * (0.5 + 0.5 * Math.cos((Math.PI * distance) / 16));
        value += joined[center + offset] * weight;
        weightSum += weight;
      }
      this.emit(weightSum ? value / weightSum : 0);
      this.position += step;
    }
  }
  process(inputs) {
    if (this.stopped) return true;
    const channels = inputs[0];
    if (!channels?.length || !channels[0].length) return true;
    const mono = new Float32Array(channels[0].length);
    for (const channel of channels)
      for (let i = 0; i < mono.length; i++)
        mono[i] += channel[i] / channels.length;
    if (sampleRate === 16000) {
      for (const value of mono) this.emit(value);
      return true;
    }
    // Windowed-sinc low-pass resampling with history across render blocks.
    const joined = new Float32Array(this.buffer.length + mono.length);
    joined.set(this.buffer);
    joined.set(mono, this.buffer.length);
    this.resample(joined, joined.length - 16);
    const drop = Math.max(0, Math.floor(this.position) - 16);
    this.buffer = joined.slice(drop);
    this.position -= drop;
    return true;
  }
}
registerProcessor("aives-pcm-capture", PcmCapture);
