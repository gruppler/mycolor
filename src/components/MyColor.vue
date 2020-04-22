<template>
  <div class="my-color" :style="{ background: color }" @click="toggle">
    <div class="charts" v-show="show">
      <canvas ref="canvas" class="absolute-full" />
      <div class="samples absolute-full flex flex-center" @click.stop>
        <q-linear-progress
          class="absolute"
          :value="(rRand.length - min) / (max - min)"
          color="accent"
          size="xl"
        />
        <q-slider
          class="absolute"
          color="secondary"
          v-model="samples"
          :min="min"
          :max="max"
          :step="10"
          label
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.my-color {
  .samples {
    height: 40px;
    top: calc(50% - 20px);
    opacity: 0.7;
    &:hover, &:active {
      opacity: 1;
    }
  }
}
</style>

<script>
const SAMPLES = 500;
const MIN = 10;
const MAX = 2000;

export default {
  name: "MyColor",
  data() {
    return {
      rRand: [],
      gRand: [],
      bRand: [],
      rHist: [],
      gHist: [],
      bHist: [],
      chart: null,
      timer: null,
      show: this.$q.localStorage.getItem("show") || false,
      samples: this.$q.localStorage.getItem("samples") || SAMPLES,
      min: MIN,
      max: MAX
    };
  },
  computed: {
    rAvg() {
      return (
        this.rRand.reduce((sum, value) => sum + value, 0) / this.rRand.length
      );
    },
    gAvg() {
      return (
        this.gRand.reduce((sum, value) => sum + value, 0) / this.gRand.length
      );
    },
    bAvg() {
      return (
        this.bRand.reduce((sum, value) => sum + value, 0) / this.bRand.length
      );
    },
    r() {
      return Math.round(255 * this.rAvg);
    },
    g() {
      return Math.round(255 * this.gAvg);
    },
    b() {
      return Math.round(255 * this.bAvg);
    },
    color() {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
  },
  methods: {
    sample() {
      this.rRand.unshift(Math.random());
      this.gRand.unshift(Math.random());
      this.bRand.unshift(Math.random());
      while (this.rRand.length > this.samples) {
        this.rRand.pop();
        this.gRand.pop();
        this.bRand.pop();
      }
      this.rHist.unshift(this.r);
      this.gHist.unshift(this.g);
      this.bHist.unshift(this.b);
      while (this.rHist.length > this.$refs.canvas.width) {
        this.rHist.pop();
        this.gHist.pop();
        this.bHist.pop();
      }
      this.drawChart();
      this.timer = requestAnimationFrame(this.sample);
    },
    start() {
      this.stop();
      this.sample();
    },
    stop() {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    },
    toggle() {
      this.show = !this.show;
    },
    initCanvas() {
      this.$refs.canvas.width = window.innerWidth;
      this.$refs.canvas.height = window.innerHeight;
    },
    drawChart() {
      const canvas = this.$refs.canvas;
      const ctx = this.chart;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < this.rHist.length; i++) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgb(${this.rHist[i]},${this.gHist[i]},${this.bHist[i]})`;
        ctx.beginPath();
        ctx.moveTo(canvas.width - i, canvas.height / 3);
        ctx.lineTo(canvas.width - i, (2 * canvas.height) / 3);
        ctx.stroke();
      }

      ctx.lineWidth = 3;
      ["r", "g", "b"].forEach(channel => {
        const values = this[channel + "Hist"];
        ctx.strokeStyle =
          channel === "r" ? "red" : channel === "g" ? "green" : "blue";
        ctx.beginPath();
        ctx.moveTo(canvas.width, this.y(values[0]));
        values.forEach((value, i) => {
          ctx.lineTo(canvas.width - i, this.y(value));
        });
        ctx.stroke();
      });

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    },
    y(value) {
      return (1 - value / 255) * this.$refs.canvas.height;
    }
  },
  watch: {
    samples(samples) {
      this.$q.localStorage.set("samples", samples);
    },
    show(show) {
      this.$q.localStorage.set("show", show);
    }
  },
  mounted() {
    let canvas = this.$refs.canvas;
    let ctx = canvas.getContext("2d");
    this.chart = ctx;
    this.initCanvas();
    window.addEventListener("resize", this.initCanvas);
    this.start();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.initCanvas);
    this.stop();
  }
};
</script>
