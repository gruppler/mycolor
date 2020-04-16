<template>
  <div class="my-color" :style="{ background: color }" @click="toggle">
    <div class="charts" v-show="showCharts">
      <canvas ref="bCanvas" />
      <canvas ref="gCanvas" />
      <canvas ref="rCanvas" />
      <div class="zero" />
      <div class="samples">
        <div
          class="current"
          :style="{ width: `${(100 * rRand.length) / max}%` }"
        >
          <div class="count">{{ rRand.length }}</div>
        </div>
        <input
          v-model="samples"
          type="range"
          :min="min"
          :max="max"
          step="10"
          @click.stop
        />
        <div class="total" :style="{ left: `${(100 * samples) / max}%` }">
          <input
            v-model="samples"
            type="number"
            :min="min"
            :max="max"
            step="10"
            @click.stop
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.my-color,
.my-color .charts,
.my-color .zero,
.my-color canvas {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
.my-color .zero {
  height: 50%;
  bottom: 50%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
}
.my-color .samples {
  position: absolute;
  height: 5em;
  bottom: calc(25% - 5em / 2);
  left: 0;
  right: 0;
}
.my-color .samples .current {
  position: absolute;
  top: 0;
  left: 0;
  height: 5em;
  background: rgba(0, 0, 0, 0.1);
}
.my-color .samples .count,
.my-color .samples .total {
  font-family: sans-serif;
  font-size: 0.8em;
  font-weight: bold;
  position: absolute;
  bottom: 0;
  right: 0;
}
.my-color .samples .count {
  top: 0;
  transform: translateX(100%);
}
.my-color .samples input[type="range"] {
  position: relative;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}
.my-color .samples input[type="number"] {
  background: transparent;
  border: 0 none;
  outline: none;
  font-weight: bold;
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
      rChart: null,
      gChart: null,
      bChart: null,
      inits: [],
      timer: null,
      showCharts: true,
      samples: SAMPLES,
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
      while (this.rHist.length > window.innerWidth) {
        this.rHist.pop();
        this.gHist.pop();
        this.bHist.pop();
      }
      this.drawChart(this.rChart, this.rHist);
      this.drawChart(this.gChart, this.gHist);
      this.drawChart(this.bChart, this.bHist);
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
      this.showCharts = !this.showCharts;
    },
    initCanvas(canvas, ctx, color) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.lineWidth = 3;
      ctx.strokeStyle =
        color === "r" ? "red" : color === "g" ? "green" : "blue";
    },
    initAll() {
      this.inits.forEach(init => init());
    },
    drawChart(ctx, values) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.beginPath();
      ctx.moveTo(window.innerWidth, this.y(values[0]));
      values.forEach((value, i) => {
        ctx.lineTo(window.innerWidth - i, this.y(value));
      });
      ctx.stroke();
    },
    y(value) {
      return (1 - value / 255) * window.innerHeight;
    }
  },
  mounted() {
    ["r", "g", "b"].forEach(c => {
      let canvas = this.$refs[c + "Canvas"];
      let ctx = canvas.getContext("2d");
      const init = () => this.initCanvas(canvas, ctx, c);
      this[c + "Chart"] = ctx;
      this.inits.push(init);
      init();
    });
    window.addEventListener("resize", this.initAll);
    this.start();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.initAll);
    this.stop();
  }
};
</script>
