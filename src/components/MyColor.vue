<template>
  <div
    class="my-color"
    :style="{ background: color }"
    @click="toggle"
    @click.right.prevent="timer ? stop() : start()"
  >
    <div class="charts" v-show="show">
      <canvas ref="canvas" class="absolute-full" />
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

import { flatten, mean } from "lodash";

export default {
  name: "MyColor",
  data() {
    return {
      sample: { r: [], g: [], b: [] },
      history: { r: [], g: [], b: [], all: [] },
      chart: null,
      timer: null,
      show: this.$q.localStorage.getItem("show") || false,
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
      return mean(
        this.history.all
          .slice(0, this.samples)
          .map(value => Math.abs(value - this.mean.sample))
      );
    },
    stdevHistory() {
      return mean(
        this.history.all.map(value => Math.abs(value - this.mean.history))
      );
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
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
  },
  methods: {
    run() {
      if (!this.samples) {
        return;
      }
      this.sample.r.unshift(Math.round(255 * Math.random()));
      this.sample.g.unshift(Math.round(255 * Math.random()));
      this.sample.b.unshift(Math.round(255 * Math.random()));
      while (this.sample.r.length > this.samples) {
        this.sample.r.pop();
        this.sample.g.pop();
        this.sample.b.pop();
      }
      this.history.r.unshift(this.r);
      this.history.g.unshift(this.g);
      this.history.b.unshift(this.b);
      this.history.all.unshift(this.r, this.g, this.b);
      while (this.history.r.length > this.$refs.canvas.width) {
        this.history.r.pop();
        this.history.g.pop();
        this.history.b.pop();
        this.history.all.pop();
        this.history.all.pop();
        this.history.all.pop();
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
    toggle() {
      this.show = !this.show;
    },
    initCanvas() {
      this.max = this.$refs.canvas.width = window.innerWidth;
      this.$refs.canvas.height = window.innerHeight;
    },
    drawChart() {
      const canvas = this.$refs.canvas;
      const ctx = this.chart;

      const dev = 3 * this.stdev;
      const devHistory = 3 * this.stdevHistory;
      const mid = canvas.height / 2;
      const top = mid - canvas.height / 6;
      const bottom = mid + canvas.height / 6;
      const right = canvas.width;
      const left = right - this.sample.r.length;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Color background
      for (let i = 0; i < this.history.r.length; i++) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgb(${this.history.r[i]},${this.history.g[i]},${this.history.b[i]})`;
        ctx.beginPath();
        ctx.moveTo(right - i, top);
        ctx.lineTo(right - i, bottom);
        ctx.stroke();
      }

      // Channel charts
      ctx.lineWidth = 1;
      ["r", "g", "b"].forEach(channel => {
        const values = this.history[channel];
        ctx.strokeStyle =
          channel === "r" ? "red" : channel === "g" ? "green" : "blue";
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
      ctx.stroke();

      // Deviation lines
      const drawDevLine = (dev, left, right, mid) => {
        ctx.lineWidth = 1;
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(left, mid - dev, right - left, dev * 2);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(left, mid);
        ctx.lineTo(right, mid);
        ctx.stroke();
      };
      drawDevLine(
        dev,
        left,
        right,
        (1 - this.mean.sample / 255) * canvas.height
      );
      drawDevLine(
        devHistory,
        0,
        left,
        (1 - this.mean.history / 255) * canvas.height
      );
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
    },
    show(show) {
      this.$q.localStorage.set("show", show);
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
