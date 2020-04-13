<template>
  <div class="my-color" :style="{ background: color }" @click="toggle">
    <div class="charts" v-show="showCharts">
      <canvas ref="bCanvas" />
      <canvas ref="gCanvas" />
      <canvas ref="rCanvas" />
      <div class="zero" />
    </div>
  </div>
</template>

<script>
const SAMPLES = 500;

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
      showCharts: true
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
      this.rRand.push(Math.random());
      this.gRand.push(Math.random());
      this.bRand.push(Math.random());
      if (this.rRand.length > SAMPLES) {
        this.rRand.shift();
        this.gRand.shift();
        this.bRand.shift();
      }
      this.rHist.push(this.r);
      this.gHist.push(this.g);
      this.bHist.push(this.b);
      while (this.rHist.length > window.innerWidth) {
        this.rHist.shift();
        this.gHist.shift();
        this.bHist.shift();
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
      ctx.moveTo(0, this.y(values[0]));
      values.forEach((value, i) => {
        ctx.lineTo(i, this.y(value));
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
</style>
