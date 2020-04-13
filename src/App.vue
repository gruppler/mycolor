<template>
  <div id="app">
    <MyColor />
  </div>
</template>

<script>
import MyColor from "./components/MyColor.vue";

export default {
  name: "App",
  components: {
    MyColor
  }
};
</script>

<style>
#app {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
