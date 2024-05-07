# slider-verify

> 滑动拼图验证

#安装
npm i slider-verify

#使用
```angular2html
<template>
  <div class="slider-verify">
    <div>
      <slider-verify
        @slider-verify="sliderVerify"
        width="450"
        height="205"
        show-type="1"
      ></slider-verify>
      <div class="verify"> {{ isVerify ? '验证成功' : '' }}</div>
    </div>
  </div>
</template>

<script>
import sliderVerify from 'slider-verify'

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
```
#props
```angular2html
<!--
    // 小拼块X轴位置
    blockX: {
      type: Number,
      default: 0
    },

    // 小拼块Y轴位置
    blockY: {
      type: Number,
      default: 0
    },

    // 小拼块颜色
    blockColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.4)',
    },

    // 小拼块大小
    size: {
      type: Number,
      default: 40
    },


    //小拼块圆角半径
    radius: {
      type: Number,
      default: 9
    },

    //拼图宽度
    width: {
      type: [Number, String],
      default: 310
    },

   //拼图高度
    height: {
      type: [Number, String],
      default: 155
    },

    //滑动条文字
    sliderText: {
      type: String,
      default: '向右拖动滑块填充拼图'
    },

    //拼图精度
    accuracy: {
      type: Number,
      default: 3 // 若为 -1 则不进行机器判断
    },

    //showType为3 弹出式时，控制显示与隐藏
    show: {
      type: Boolean,
      default: false
    },

    //背景图数组集合
    imgs: {
      type: Array,
      default: () => {
        return [
          'https://t7.baidu.com/it/u=860330160,4117395242&fm=193&f=GIF',
          'https://t7.baidu.com/it/u=860330160,4117395242&fm=193&f=GIF',
          'https://img2.baidu.com/it/u=2859830666,3560048188&fm=253&fmt=auto&app=138&f=JPEG?w=300&h=150',
          'https://img0.baidu.com/it/u=3174225490,1485629145&fm=253&fmt=auto&app=138&f=JPEG?w=300&h=150',
          'https://img0.baidu.com/it/u=443192671,4249194390&fm=253&fmt=auto&app=138&f=JPEG?w=602&h=383',
        ]
      }
    },

    //滑动按钮高度
    sliderHeight: {
      type: Number,
      default: 40
    },

    //拼图方式，1嵌入式，2触发式，3弹出式
    showType: {
      type: [Number, String],
      default: 1
    },

    //滑块自定义样式
    sliderStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },

    //3弹出式时点击遮罩是否可关闭
    maskClose: {
      type: Boolean,
      default: false,
    }

-->

```

#Event
```angular2html
slider-verify 验证事件， true/false
refresh  刷新事件
success  验证成功事件
again  验证失败重试事件
fail  失败事件
close  3弹出式时点击遮罩关闭事件
```
