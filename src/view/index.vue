<template>
  <div class="slider-verify">
    <div>
      <slider-verify @slider-verify="sliderVerify" width="450" height="205" show-type="1"></slider-verify>
      <div class="verify"> {{ isVerify ? '验证成功' : '' }}</div>
    </div>
  </div>
</template>

<script>
import sliderVerify from '@/components/slider-verify.vue'

export default {
  name: "index",
  components: {
    sliderVerify
  },

  data(){
    return{
      isVerify: false,
    }
  },

  methods: {
    //图形验证
    sliderVerify(isVerify) {
      this.isVerify = isVerify
      console.log(isVerify)
    },
  },

}
</script>

<style scoped>
.slider-verify{
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.verify{
  width: 100%;
  padding-top: 20px;
  text-align: center;
}
</style>
