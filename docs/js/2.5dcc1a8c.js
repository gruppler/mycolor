(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[2],{"8b24":function(t,s,e){"use strict";e.r(s);var i=function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("q-page",{staticClass:"flex flex-center"},[e("MyColor",{staticClass:"fullscreen"})],1)},h=[],n=function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{staticClass:"my-color",style:{background:t.color},on:{click:t.togglePlay,contextmenu:function(s){return s.preventDefault(),t.toggleView(s)}}},[e("div",{directives:[{name:"show",rawName:"v-show",value:t.show,expression:"show"}],staticClass:"charts"},[e("canvas",{ref:"canvas",staticClass:"absolute-full"}),e("div",{staticClass:"samples absolute-full flex flex-center",on:{click:function(t){t.stopPropagation()}}},[e("q-slider",{staticClass:"absolute",attrs:{color:"accent",min:0,max:t.max,step:10,label:"","label-text-color":"secondary",reverse:""},model:{value:t.samples,callback:function(s){t.samples=s},expression:"samples"}})],1)]),e("q-resize-observer",{on:{resize:t.initCanvas}})],1)},r=[],a=(e("6b54"),e("06db"),e("5d0f")),o=e.n(a),l=e("2ef0"),c=300,u=3,m=function(t,s,e){return Math.abs(t-s)/e},p={name:"MyColor",data:function(){return{sample:{r:[],g:[],b:[]},history:{r:[],g:[],b:[],all:[],mean:[],stdev:[],z:[]},chart:null,timer:null,show:this.$q.localStorage.getItem("show")||!1,samples:this.$q.localStorage.getItem("samples")||c,min:10,max:window.innerWidth}},computed:{mean:function(){return{r:Object(l["mean"])(this.sample.r),g:Object(l["mean"])(this.sample.g),b:Object(l["mean"])(this.sample.b),sample:Object(l["mean"])(this.history.all.slice(0,this.samples)),history:Object(l["mean"])(this.history.all)}},stdev:function(){var t=this;return Math.sqrt(Object(l["mean"])(this.history.all.slice(0,this.samples).map((function(s){return Math.pow(s-t.mean.sample,2)}))))},stdevHistory:function(){var t=this;return Math.sqrt(Object(l["mean"])(this.history.all.map((function(s){return Math.pow(s-t.mean.history,2)}))))},z:function(){var t=127.5,s=this.stdevHistory,e=m(this.r,t,s),i=m(this.g,t,s),h=m(this.b,t,s);return Object(l["mean"])([e,i,h])},r:function(){return Math.round(this.mean.r)},g:function(){return Math.round(this.mean.g)},b:function(){return Math.round(this.mean.b)},color:function(){return this.getColor(0).toString(o.a.RGB)}},methods:{getColor:function(t){var s=new o.a(this.history.r[t],this.history.g[t],this.history.b[t]),e=this.history.z[t];return e>u&&s.tune({s:(e-u)*u}),s},run:function(){if(this.samples){while(this.sample.r.length<=this.samples)this.sample.r.unshift(Math.round(255*Math.random())),this.sample.g.unshift(Math.round(255*Math.random())),this.sample.b.unshift(Math.round(255*Math.random()));while(this.sample.r.length>this.samples)this.sample.r.pop(),this.sample.g.pop(),this.sample.b.pop();this.history.r.unshift(this.r),this.history.g.unshift(this.g),this.history.b.unshift(this.b),this.history.all.unshift(this.r,this.g,this.b),this.history.mean.unshift(this.mean.history),this.history.stdev.unshift(this.stdevHistory),this.history.z.unshift(this.z);while(this.history.r.length>this.$refs.canvas.width)this.history.r.pop(),this.history.g.pop(),this.history.b.pop(),this.history.all.pop(),this.history.all.pop(),this.history.all.pop(),this.history.mean.pop(),this.history.stdev.pop(),this.history.z.pop();this.drawChart(),this.timer=requestAnimationFrame(this.run)}},start:function(){this.stop(),this.run()},stop:function(){cancelAnimationFrame(this.timer),this.timer=null},toggleView:function(){this.show=!this.show},togglePlay:function(){this.timer?this.stop():this.start()},initCanvas:function(){this.max=this.$refs.canvas.width=window.innerWidth,this.$refs.canvas.height=window.innerHeight},drawChart:function(){var t=this,s=this.$refs.canvas,e=this.chart,i=u*this.stdev,h=(this.stdevHistory,s.height/2),n=(s.height,s.height,s.width),r=n-this.sample.r.length;e.clearRect(0,0,s.width,s.height);for(var a=0;a<this.history.r.length;a++){var l=s.height*u*this.history.stdev[a]/255;e.strokeStyle="rgba(0,0,0,0.2)",e.lineWidth=1,e.beginPath(),e.moveTo(n-a,h-l),e.lineTo(n-a,h+l),e.stroke();var c=s.height*this.history.z[a]*this.history.stdev[a]/255;e.strokeStyle=this.getColor(a).toString(o.a.RGB),e.beginPath(),e.moveTo(n-a,h-c),e.lineTo(n-a,h+c),e.stroke();var m=s.height*(1-this.history.mean[a]/255);e.strokeStyle="rgba(255,255,255,0.25)",e.beginPath(),e.moveTo(n-a,m),e.lineTo(n-a,h),e.stroke()}e.lineWidth=1,["r","g","b"].forEach((function(s){var i=t.history[s];e.strokeStyle="r"===s?"red":"g"===s?"green":"blue",e.beginPath(),e.moveTo(n,t.y(i[0])),i.forEach((function(s,i){e.lineTo(n-i,t.y(s))})),e.stroke()})),e.strokeStyle="rgba(255, 255, 255, 0.5)",e.lineWidth=1,e.beginPath(),e.moveTo(r,0),e.lineTo(r,s.height),e.stroke();var p=s.height*i/255,f=(1-this.mean.sample/255)*s.height;e.fillStyle="rgba(255,255,255,0.1)",e.fillRect(r,f-p,n-r,2*p),e.fillStyle="rgba(255,255,255,0.2)",e.fillRect(r,Math.min(h,f),n-r,Math.abs(h-f))},y:function(t){return(1-t/255)*this.$refs.canvas.height}},watch:{samples:function(t,s){this.$q.localStorage.set("samples",t),t&&!s&&this.run()},show:function(t){this.$q.localStorage.set("show",t)}},mounted:function(){var t=this.$refs.canvas,s=t.getContext("2d");this.chart=s,this.start()},beforeDestroy:function(){this.stop()}},f=p,g=(e("a535"),e("2877")),y=e("eebe"),b=e.n(y),d=e("c1d0"),v=e("3980"),w=Object(g["a"])(f,n,r,!1,null,null,null),M=w.exports;b()(w,"components",{QSlider:d["a"],QResizeObserver:v["a"]});var C={name:"PageIndex",components:{MyColor:M}},k=C,x=e("9989"),S=Object(g["a"])(k,i,h,!1,null,null,null);s["default"]=S.exports;b()(S,"components",{QPage:x["a"]})},a535:function(t,s,e){"use strict";var i=e("e23b"),h=e.n(i);h.a},e23b:function(t,s,e){}}]);