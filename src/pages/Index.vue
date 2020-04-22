<template>
  <q-page class="flex flex-center">
    <MyColor class="fullscreen" />
  </q-page>
</template>

<script>
import MyColor from "../components/MyColor";

export default {
  name: "PageIndex",
  components: { MyColor }
};
</script>
