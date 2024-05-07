<template>
  <div class="slider-verify">
    <div>
      <slider-verify @slider-verify="sliderVerify" :verify-by-api="true" :width="imgWidth" :height="imgheight"
        :block-x="blockX" :block-y="blockY" :block-color="blockColor"
        :imgs="imgs" :show-type="1"></slider-verify>
      <div class="verify"> {{ isVerify ? '验证成功' : '' }}</div>
    </div>
  </div>
</template>

<script>
  /* eslint-disable */
  import sliderVerify from '@/components/slider-verify.vue'

  export default {
    name: "index",
    components: {
      sliderVerify
    },

    data() {
      return {
        isVerify: false,
        imgWidth: 450,
        imgheight: 205,
        imgs: [], //图片数组
        blockX: 0, //拼块在图片上的X坐标
        blockY: 0, //拼块在图片上的Y坐标
        blockColor: '', //拼块颜色
      }
    },

    created() {
      this.init()
    },

    methods: {
      init() {
        //接口获取参数
        new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log('init')
            this.imgs = [
              'https://t7.baidu.com/it/u=860330160,4117395242&fm=193&f=GIF',
              'https://t7.baidu.com/it/u=860330160,4117395242&fm=193&f=GIF',
              'https://img2.baidu.com/it/u=2859830666,3560048188&fm=253&fmt=auto&app=138&f=JPEG?w=300&h=150',
              'https://img0.baidu.com/it/u=3174225490,1485629145&fm=253&fmt=auto&app=138&f=JPEG?w=300&h=150',
              'https://img0.baidu.com/it/u=443192671,4249194390&fm=253&fmt=auto&app=138&f=JPEG?w=602&h=383',
            ]
            this.blockX = 200
            this.blockY = 100
            this.blockColor = 'rgba(200,200,200,0.5)'
          }, 500)
        })
      },

      //图形验证
      sliderVerify(e) {
        if(e.result !== true) {
          //验证失败，请求接口重置
          this.init()
          return false
        } else {
          //前端验证成功，提交接口验证
          console.log(e)
          this.isVerify = e.result
        }
      },
    },

  }
</script>

<style scoped>
  .slider-verify {
    position: fixed;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  .verify {
    width: 100%;
    padding-top: 20px;
    text-align: center;
  }
</style>
