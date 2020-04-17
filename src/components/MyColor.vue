<template>
  <div class="my-color" :style="{ background: color }" @click="toggle">
    <div class="charts" v-show="showChart">
      <canvas ref="canvas" />
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
.my-color .samples {
  position: absolute;
  height: 80px;
  bottom: calc(25% - 80px / 2);
  left: 0;
  right: 0;
}
.my-color .samples .current {
  position: absolute;
  top: 0;
  left: 0;
  height: 80px;
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
      chart: null,
      timer: null,
      showChart: true,
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
      this.showChart = !this.showChart;
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
