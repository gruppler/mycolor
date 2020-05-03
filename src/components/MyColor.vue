<template>
  <div class="my-color" @click="togglePlay" @click.right.prevent="save">
    <div class="charts">
      <canvas ref="canvas" class="absolute-full" :style="{ background: color }" />
      <div class="samples absolute-full flex flex-center" @click.stop>
        <q-slider
          class="absolute"
          color="accent"
          v-model="samples"
          :min="0"
          :max="max"
          :step="10"
          label
          label-text-color="secondary"
          reverse
        />
      </div>
    </div>
    <q-resize-observer @resize="initCanvas" />
  </div>
</template>

<style lang="scss">
.my-color {
  .samples {
    height: 40px;
    top: calc(50% - 20px);
  }
}
</style>

<script>
const SAMPLES = 300;
const THRESHOLD = 3;

const RED = "rgba(255,0,0,0.25)";
const GREEN = "rgba(0,255,0,0.25)";
const BLUE = "rgba(0,0,255,0.25)";

import { exportFile } from "quasar";
import { flatten, mean } from "lodash";
import Color from "color-lite";

const z = (value, mean, stdev) => Math.abs(value - mean) / stdev;

export default {
  name: "MyColor",
  data() {
    return {
      sample: { r: [], g: [], b: [] },
      history: { r: [], g: [], b: [], all: [], mean: [], stdev: [], z: [] },
      chart: null,
      timer: null,
      samples: this.$q.localStorage.getItem("samples") || SAMPLES,
      min: 10,
      max: window.innerWidth
    };
  },
  computed: {
    mean() {
      return {
        r: mean(this.sample.r),
        g: mean(this.sample.g),
        b: mean(this.sample.b),
        sample: mean(this.history.all.slice(0, this.samples)),
        history: mean(this.history.all)
      };
    },
    stdev() {
      return {
        sample: Math.sqrt(
          mean(
            this.history.all
              .slice(0, this.samples)
              .map(value => Math.pow(value - this.mean.sample, 2))
          )
        ),
        history: Math.sqrt(
          mean(
            this.history.all.map(value =>
              Math.pow(value - this.mean.history, 2)
            )
          )
        )
      };
    },
    z() {
      const avg = this.mean.sample;
      const stdev = this.stdev.sample;
      const r = z(this.r, avg, stdev);
      const g = z(this.g, avg, stdev);
      const b = z(this.b, avg, stdev);
      return mean([r, g, b]);
    },
    r() {
      return Math.round(this.mean.r);
    },
    g() {
      return Math.round(this.mean.g);
    },
    b() {
      return Math.round(this.mean.b);
    },
    color() {
      return this.getColor(0).toString();
    }
  },
  methods: {
    getColor(i) {
      let color = new Color(
        this.history.r[i],
        this.history.g[i],
        this.history.b[i]
      );
      return color;
    },
    run() {
      if (!this.samples) {
        return;
      }
      while (this.sample.r.length <= this.samples) {
        this.sample.r.unshift(Math.round(255 * Math.random()));
        this.sample.g.unshift(Math.round(255 * Math.random()));
        this.sample.b.unshift(Math.round(255 * Math.random()));
      }
      while (this.sample.r.length > this.samples) {
        this.sample.r.pop();
        this.sample.g.pop();
        this.sample.b.pop();
      }
      this.history.r.unshift(this.r);
      this.history.g.unshift(this.g);
      this.history.b.unshift(this.b);
      this.history.all.unshift(this.r, this.g, this.b);
      this.history.mean.unshift(this.mean.sample);
      this.history.stdev.unshift(this.stdev.history);
      this.history.z.unshift(this.z);
      while (this.history.r.length > this.$refs.canvas.width) {
        this.history.r.pop();
        this.history.g.pop();
        this.history.b.pop();
        this.history.all.pop();
        this.history.all.pop();
        this.history.all.pop();
        this.history.mean.pop();
        this.history.stdev.pop();
        this.history.z.pop();
      }
      this.drawChart();
      this.timer = requestAnimationFrame(this.run);
    },
    start() {
      this.stop();
      this.run();
    },
    stop() {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    },
    save() {
      const now = new Date();
      let filename = `MyColor ${now.toISOString()}.png`;
      this.$refs.canvas.toBlob(blob => exportFile(filename, blob), "image/png");
    },
    togglePlay() {
      this.timer ? this.stop() : this.start();
    },
    initCanvas() {
      this.max = this.$refs.canvas.width = window.innerWidth;
      this.$refs.canvas.height = window.innerHeight;
    },
    drawChart() {
      const canvas = this.$refs.canvas;
      const ctx = this.chart;

      const dev = THRESHOLD * this.stdev.sample;
      const devHistory = THRESHOLD * this.stdev.history;
      const mid = canvas.height / 2;
      const top = mid - canvas.height / 6;
      const bottom = mid + canvas.height / 6;
      const right = canvas.width;
      const left = right - this.sample.r.length;

      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < this.history.r.length; i++) {
        // Historical deviation
        const color = this.getColor(i);
        let d = (canvas.height * THRESHOLD * this.history.stdev[i]) / 255;
        ctx.strokeStyle = color
          .clone()
          .tune({ l: -10 })
          .toString();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(right - i, mid - d);
        ctx.lineTo(right - i, mid + d);
        ctx.stroke();

        // Historical absolute zScore
        let mean = 1 - this.history.mean[i] / 255;
        let hm = canvas.height * mean;
        let az =
          (canvas.height * this.history.z[i] * this.history.stdev[i]) / 255;
        ctx.strokeStyle = color.toString();
        ctx.beginPath();
        ctx.moveTo(right - i, hm - az);
        ctx.lineTo(right - i, hm + az);
        ctx.stroke();

        // Historical Mean
        ctx.strokeStyle = color
          .clone()
          .tune({ s: 30 * Math.abs(mean) })
          .toString();
        ctx.beginPath();
        ctx.moveTo(right - i, hm);
        ctx.lineTo(right - i, mid);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.moveTo(right - i, hm);
        ctx.lineTo(right - i, hm + (hm < mid ? 1 : -1));
        ctx.stroke();
      }

      // Channel charts
      ctx.lineWidth = 1;
      ["r", "g", "b"].forEach(channel => {
        const values = this.history[channel];
        ctx.strokeStyle =
          channel === "r" ? RED : channel === "g" ? GREEN : BLUE;
        ctx.beginPath();
        ctx.moveTo(right, this.y(values[0]));
        values.forEach((value, i) => {
          ctx.lineTo(right - i, this.y(value));
        });
        ctx.stroke();
      });

      // Axes
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, 0);
      ctx.lineTo(left, canvas.height);
      ctx.moveTo(left, mid);
      ctx.lineTo(right, mid);
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.moveTo(0, mid);
      ctx.lineTo(left, mid);
      ctx.stroke();

      // Sample Deviation and Mean
      let d = (canvas.height * dev) / 255;
      let m = (1 - this.mean.sample / 255) * canvas.height;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(left, m - d, right - left, d * 2);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(left, Math.min(mid, m), right - left, Math.abs(mid - m));
    },
    y(value) {
      return (1 - value / 255) * this.$refs.canvas.height;
    }
  },
  watch: {
    samples(samples, prevSamples) {
      this.$q.localStorage.set("samples", samples);
      if (samples && !prevSamples) {
        this.run();
      }
    }
  },
  mounted() {
    let canvas = this.$refs.canvas;
    let ctx = canvas.getContext("2d");
    this.chart = ctx;
    this.start();
  },
  beforeDestroy() {
    this.stop();
  }
};
</script>
