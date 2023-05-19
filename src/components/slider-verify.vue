<template>
  <div v-show="isShowSliderVrify" id="slideVerifyShowTypeEq3" :style="showType == 3 ?
    {position: 'fixed', 'z-index': '999999', top: slider_position_top + 'px', left: slider_position_left + 'px', width: width+'px', height: height+'px'} : {}">
    <div v-if="showType == 3" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#999999;opacity:0.8;"
         @click="hideSlider"></div>
    <div class="slide-verify" id="slideVerify" onselectstart="return false;"
         @mouseover="mouseover" @mouseout="mouseout"
         :style="{ width: width + 'px', height: showType == 2 ? sliderHeight + 'px' : 'auto' }"
         :class="{'container-active': containerActive, 'container-success': containerSuccess, 'container-fail': containerFail}">
      <div v-show="isShowPic" :style="isShowPic && showType == 2 ?
        'width:'+width+'px;height:'+height+'px;position:absolute;top:-'+(height)+'px;left:0;z-index:999999' :
        'width:'+width+'px;height:'+height+'px;'">
        <div v-show="loadBlock" class="slider-verify-loading">
          <div class="loader"></div>
        </div>
        <canvas :style="loadBlock ? {position:'fixed', top:'-2000px'} : {}" :width="width" :height="height"
                ref="canvas"></canvas>
        <div @click="refresh" class="slide-verify-refresh-icon"></div>
        <div class="slide-verify-slider-mask-item_canvas" style="cursor: pointer;"
             @mousedown="sliderDown"
             @touchstart="touchStartEvent"
             @touchmove="handleMoveEvent($event, 'touch')"
             @touchend="handleMoveEndEvent($event, 'touch')">
          <canvas :width="width" :height="height" ref="block" class="slide-verify-block"></canvas>
        </div>
      </div>
      <div :style="{height: sliderHeight + 'px', 'line-height': sliderHeight + 'px', ...sliderStyle}"
           :class="{'slide-verify-slider': true ,'container-active': containerActive, 'container-success': containerSuccess, 'container-fail': containerFail}">
        <div class="slide-verify-slider-mask container-default"
             :style="{width: sliderMaskWidth + 'px', height: (sliderHeight - 2) + 'px'}">
          <div @mousedown="sliderDown"
               @touchstart="touchStartEvent"
               @touchmove="handleMoveEvent($event, 'touch')"
               @touchend="handleMoveEndEvent($event, 'touch')"
               class="slide-verify-slider-mask-item"
               :style="{left: sliderLeft + 'px', height: (sliderHeight - 2) + 'px'}">
            <div class="slide-verify-slider-mask-item-icon"></div>
          </div>
        </div>
        <span class="slide-verify-slider-text">{{ sliderText }}</span>
      </div>
    </div>
  </div>
</template>

<script>
function sum(x, y) {
  return x + y
}

function square(x) {
  return x * x
}

export default {
  name: 'slider-verify',
  props: {
    //小拼块大小
    l: {
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

  },

  watch: {
    show: {
      handler(val) {
        this.isShowSliderVrify = val
      }
    }
  },

  data() {
    return {
      containerActive: false, // container active class
      containerSuccess: false, // container success class
      containerFail: false, // container fail class
      canvasCtx: null,
      blockCtx: null,
      block: null,
      block_x: undefined, // container random position
      block_y: undefined,
      L: this.l + this.radius * 2 + 3, // block real length
      img: undefined,
      originX: undefined,
      originY: undefined,
      isMouseDown: false,
      trail: [],
      sliderLeft: 0, // block right offset
      sliderMaskWidth: 0, // mask width,
      success: false, // Bug Fixes 修复了验证成功后还能滑动
      loadBlock: true, // Features 图片加载提示，防止图片没加载完就开始验证
      timestamp: null,
      isShowPic: true,
      isShowSliderVrify: false,

      //弹出式时，滑动验证框位置
      slider_position_top: 0,
      slider_position_left: 0,
    }
  },

  created() {
    if (this.showType == 2) {
      this.isShowPic = false
    }
    if (this.showType == 3) {
      this.isShowSliderVrify = false
      let windowHeight = document.documentElement.clientHeight || document.body.clientHeight
      let windowWidth = document.documentElement.clientWidth || document.body.clientWidth
      this.slider_position_top = (windowHeight - this.height) / 2
      this.slider_position_left = (windowWidth - this.width) / 2
    } else {
      this.isShowSliderVrify = true
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.loadBlock = true
      this.block = this.$refs.block
      this.canvasCtx = this.$refs.canvas.getContext('2d')
      this.blockCtx = this.block.getContext('2d')
      this.imgLoad()
      this.bindEvents()
    },

    imgLoad() {
      this.img = this.imgs[this.getRandomNumberByRange(0, this.imgs.length - 1)]
      let img = new Image()
      img.src = this.img
      img.crossOrigin = 'Anonymous'
      img.onerror = (err) => {
        console.error(err)
        img = this.imgLoad()
        return false
      }
      img.onload = (e) => {
        this.drawBlock()
        this.canvasCtx.drawImage(img, 0, 0, this.width, this.height)
        this.blockCtx.drawImage(img, 0, 0, this.width, this.height)
        let {
          block_x: x,
          block_y: y,
          radius,
          L
        } = this
        let _y = y - radius * 2 - 1
        let ImageData = this.blockCtx.getImageData(x, _y, L, L)
        this.block.width = L
        this.blockCtx.putImageData(ImageData, 0, _y)
        // 图片加载完关闭遮蔽罩
        this.loadBlock = false
      }
    },

    drawBlock() {
      this.block_x = this.getRandomNumberByRange(this.L + 10, this.width - (this.L + 10))
      this.block_y = this.getRandomNumberByRange(10 + this.radius * 2, this.height - (this.L + 10))
      this.draw(this.canvasCtx, this.block_x, this.block_y, 'fill')
      this.draw(this.blockCtx, this.block_x, this.block_y, 'clip')
    },

    draw(ctx, x, y, operation) {
      let l = this.l
      let r = this.radius
      let PI = Math.PI
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.arc(x + l / 2, y, r, PI, 2 * PI)
      ctx.lineTo(x + l, y)
      ctx.arc(x + l, y + l / 2, r, 1.5 * PI, 2.5 * PI)
      ctx.lineTo(x + l, y + l)
      ctx.lineTo(x, y + l)
      ctx.arc(x, y + l / 2, r + 0.4, 2.5 * PI, 1.5 * PI, true)
      ctx.lineTo(x, y)
      ctx.lineWidth = 2
      // ctx.fillStyle = 'rgba('+this.getRandomNumberByRange(0, 255)+', '+this.getRandomNumberByRange(0, 255)+', '+this.getRandomNumberByRange(0, 255)+', 0.3)'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.stroke()
      ctx[operation]()
      // Bug Fixes 修复了火狐和ie显示问题
      ctx.globalCompositeOperation = 'destination-over'
    },

    getRandomNumberByRange(start, end) {
      return Math.round(Math.random() * (end - start) + start)
    },

    refresh() {
      this.reset()
      this.$emit('refresh')
      this.$emit('slider-verify', false)
    },

    sliderDown(event) {
      if (this.success) return
      this.originX = event.clientX
      this.originY = event.clientY
      this.isMouseDown = true
      this.timestamp = +new Date()
    },

    mouseover() {
      if (this.showType != 2) return
      // if (this.success) return
      this.isShowPic = true
    },

    mouseout() {
      if (this.showType != 2) return
      if (this.isMouseDown) return
      this.isShowPic = false
    },

    touchStartEvent(e) {
      if (this.success) return
      if (this.showType == 2) {
        this.isShowPic = true
      }
      this.originX = e.changedTouches[0].pageX
      this.originY = e.changedTouches[0].pageY
      this.isMouseDown = true
      this.timestamp = +new Date()
    },

    bindEvents() {
      document.addEventListener('mousemove', this.handleMoveEvent)
      document.addEventListener('mouseup', this.handleMoveEndEvent)
    },

    // 处理函数抽离
    handleMoveEvent(e, type = 'mouse') {
      if (!this.isMouseDown) return false
      const moveX = type === 'mouse' ? e.clientX - this.originX : e.changedTouches[0].pageX - this.originX
      const moveY = type === 'mouse' ? e.clientY - this.originY : e.changedTouches[0].pageY - this.originY
      if (moveX < 0 || moveX + 38 >= this.width) return false
      this.sliderLeft = moveX
      let blockLeft = (this.width - 40 - 20) / (this.width - 40) * moveX
      this.block.style.left = blockLeft + 'px'

      this.containerActive = true // add active
      this.sliderMaskWidth = (moveX + 2)
      this.trail.push(moveY)
    },

    handleMoveEndEvent(e, type = 'mouse') {
      if (!this.isMouseDown) return false
      this.isMouseDown = false
      if ((type === 'mouse' && e.clientX === this.originX) || (type === 'touch' && e.changedTouches[0].pageX === this.originX)) return false
      this.timestamp = +new Date() - this.timestamp
      if (this.showType == 2) {
        this.isShowPic = false
      }
      const {
        spliced,
        TuringTest
      } = this.verify()
      if (spliced) {
        if (this.accuracy === -1) {
          this.containerSuccess = true
          this.success = true
          this.$emit('success', this.timestamp)
          this.$emit('slider-verify', true)
          return
        }
        if (TuringTest) {
          this.containerSuccess = true
          this.success = true
          this.$emit('success', this.timestamp)
          this.$emit('slider-verify', true)
        } else {
          this.containerFail = true
          this.$emit('again')
          this.$emit('slider-verify', false)
        }
      } else {
        this.containerFail = true
        this.$emit('fail')
        this.$emit('slider-verify', false)
        setTimeout(() => {
          this.reset()
        }, 500)
      }
      setTimeout(() => {
        this.containerActive = false // remove active
      }, 50)
    },

    verify() {
      const arr = this.trail // drag y move distance
      const average = arr.reduce(sum) / arr.length // average
      const deviations = arr.map(x => x - average) // deviation array
      const stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length) // standard deviation
      const left = parseInt(this.block.style.left)
      const accuracy = this.accuracy <= 1 ? 1 : this.accuracy > 10 ? 10 : this.accuracy
      return {
        spliced: Math.abs(left - this.block_x) <= accuracy,
        TuringTest: average !== stddev // equal => not person operate
      }
    },

    reset() {
      this.success = false
      this.containerActive = false
      this.containerSuccess = false
      this.containerFail = false
      this.sliderLeft = 0
      this.block.style.left = 0
      this.sliderMaskWidth = 0
      // canvas
      this.canvasCtx.clearRect(0, 0, this.width, this.height)
      this.blockCtx.clearRect(0, 0, this.width, this.height)
      this.block.width = this.width
      this.init()
    },

    hideSlider() {
      if (this.maskClose === false) {
        return false
      }
      this.isShowSliderVrify = false
      this.$emit('close')
    },

  },

  destroyed() {
    document.removeEventListener('mousemove', this.handleMoveEvent)
    document.removeEventListener('mouseup', this.handleMoveEndEvent)
  }


}
</script>

<style scoped>
.slide-verify {
  position: relative;
}

/* 图片加载样式 */
.slider-verify-loading {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 999999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader {
  font-size: 5px;
  margin: 0 auto;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  position: relative;
  text-indent: -9999em;
  /* liner：规定以相同速度开始至结束的过渡效果*/
  animation: load4 1.3s infinite linear;
}

@keyframes load4 {
  0%,
  100% {
    box-shadow: 0em -3em 0em 0.2em #999999,
    2em -2em 0 0em #999999,
    3em 0em 0 -0.5em #999999,
    2em 2em 0 -0.5em #999999,
    0em 3em 0 -0.5em #999999,
    -2em 2em 0 -0.5em #999999,
    -3em 0em 0 -0.5em #999999,
    -2em -2em 0 0em #999999;
  }
  12.5% {
    box-shadow: 0em -3em 0em 0em #999999,
    2em -2em 0 0.2em #999999,
    3em 0em 0 0em #999999,
    2em 2em 0 -0.5em #999999,
    0em 3em 0 -0.5em #999999,
    -2em 2em 0 -0.5em #999999,
    -3em 0em 0 -0.5em #999999,
    -2em -2em 0 -0.5em #999999;
  }
  25% {
    box-shadow: 0em -3em 0em -0.5em #999999,
    2em -2em 0 0em #999999,
    3em 0em 0 0.2em #999999,
    2em 2em 0 0em #999999,
    0em 3em 0 -0.5em #999999,
    -2em 2em 0 -0.5em #999999,
    -3em 0em 0 -0.5em #999999,
    -2em -2em 0 -0.5em #999999;
  }
  37.5% {
    box-shadow: 0em -3em 0em -0.5em #999999,
    2em -2em 0 -0.5em #999999,
    3em 0em 0 0em #999999,
    2em 2em 0 0.2em #999999,
    0em 3em 0 0em #999999,
    -2em 2em 0 -0.5em #999999,
    -3em 0em 0 -0.5em #999999,
    -2em -2em 0 -0.5em #999999;
  }
  50% {
    box-shadow: 0em -3em 0em -0.5em #999999,
    2em -2em 0 -0.5em #999999,
    3em 0em 0 -0.5em #999999,
    2em 2em 0 0em #999999,
    0em 3em 0 0.2em #999999,
    -2em 2em 0 0em #999999,
    -3em 0em 0 -0.5em #999999,
    -2em -2em 0 -0.5em #999999;
  }
  62.5% {
    box-shadow: 0em -3em 0em -0.5em #999999,
    2em -2em 0 -0.5em #999999,
    3em 0em 0 -0.5em #999999,
    2em 2em 0 -0.5em #999999,
    0em 3em 0 0em #999999,
    -2em 2em 0 0.2em #999999,
    -3em 0em 0 0em #999999,
    -2em -2em 0 -0.5em #999999;
  }
  75% {
    box-shadow: 0em -3em 0em -0.5em #999999,
    2em -2em 0 -0.5em #999999,
    3em 0em 0 -0.5em #999999,
    2em 2em 0 -0.5em #999999,
    0em 3em 0 -0.5em #999999,
    -2em 2em 0 0em #999999,
    -3em 0em 0 0.2em #999999,
    -2em -2em 0 0em #999999;
  }
  87.5% {
    box-shadow: 0em -3em 0em 0em #999999,
    2em -2em 0 -0.5em #999999,
    3em 0em 0 -0.5em #999999,
    2em 2em 0 -0.5em #999999,
    0em 3em 0 -0.5em #999999,
    -2em 2em 0 0em #999999,
    -3em 0em 0 0em #999999,
    -2em -2em 0 0.2em #999999;
  }
}


.slide-verify-block {
  position: absolute;
  left: 0;
  top: 0
}

.slide-verify-refresh-icon {
  position: absolute;
  right: 0;
  top: 0;
  width: 34px;
  height: 34px;
  cursor: pointer;
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAHXCAMAAADusXjuAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAGdtcwAAAAAAAAAAAAAAAAAAABmR+gECAgAAAAAAAAAAAAAAAAAAAAAAAPf49QAAAAAAAAAAAAAAAAAAALLS/QICAgEBAf///wAAAGS1/P///////wAAAP///xyS+gAAAN3q/pWbof///6Gqs////wAAAAAAACCV+v///zef+5LL/Xq2+woKCkVJTZWdppefqAIDAv///////////5WdpqvX/Z/R/Vyx/KDS/Zyjq5mhqpefqP///2ltcGdtczub+pafqP///0VJTY2hp5WdpgAAAGdtc////0Gk+3e//P///////yDIrvBnZ////8zQ1P////////b39P///6Kqsv///////5WdppefqP////T18pWdppWdpiDIrubw/gICAvb39P///yDIriaX+pWdpUan+5rP/R4eHr2+u////////////5Wdpv///////5WdpuHi3/Lz8Git+8nf/Wdtc/////////Dx7v///9LS0JWdpiDIrvBnZ/BnZ77Z/ZWdppWdppWdpuDh3uzt6q6vrZWdpmdtc+rr6dPU0cvLydbX1JWdpkVJTZnF/O71/vf6//BnZ2dtc////////9LT0Ovs6ru8uZWdppWdppWdpjM0M5WdppWdppWdplSl+/BnZ+bn5O7v7AMDA6Gqs2dtc////77g/v///6TT/bfc/Vau+3vA/P///////4TE/P///////////6bU/f///////7W2szIzMozI/P///2y5/P///y6b+pWdpoq+/KbM/JWdpv///////////yDIriDIrqGqs2dtc6Gqs6Gqs6Gqs////2dtc0VJTZWdpmdtc////x0dHZWdptPl/kVJTSDIriDIrmdtc6iopsDBvvX282FmaWdtc5Wdpv///yDIriDIrvBnZ2dtc6Gqs6Gqs6Gqs2dtc2dtc2dtc2dtc/BnZ35+ffBnZ0VJTWdtc2dtc2dtc35+ff///2dtc9/g3oOKkp6nsL3CyP7//v///6Gqs/f49fBnZyDIrmdtc0VJTdgAqpkAAAD5dFJOUwDMDxgGBArMAQIMDhYDB5kFEwkVHeUfHHgU2tgZEafMIvJD5Oc+GxrNk9Ll2SZF6wge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") 0 -437px;
  background-size: 34px 471px
}

.slide-verify-slider {
  position: relative;
  text-align: center;
  width: 100%;
  height: 40px;
  line-height: 40px;
  background: #e0ecff;
  color: #45494c;
  /*border: 1px solid #e4e7eb*/
  border-top: 1px solid #e4e7eb;
  border-bottom: 1px solid #e4e7eb;
}

.slide-verify-slider-mask {
  position: absolute;
  left: 0;
  top: 0;
  height: 40px;
  border: 0 solid #1991FA;
  background: #D1E9FE
}

.slide-verify-slider-mask-item {
  position: absolute;
  /*top: 0;*/
  left: 0;
  width: 40px;
  height: 40px;
  background: #fff;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background .2s linear
}

.slide-verify-slider-mask-item:hover {
  background: #1991FA
}

.slide-verify-slider-mask-item:hover .slide-verify-slider-mask-item-icon {
  background-position: 0 -13px
}

.slide-verify-slider-mask-item-icon {
  position: absolute;
  top: calc(50% - 6px);
  left: 13px;
  width: 14px;
  height: 12px;
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAHXCAMAAADusXjuAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAGdtcwAAAAAAAAAAAAAAAAAAABmR+gECAgAAAAAAAAAAAAAAAAAAAAAAAPf49QAAAAAAAAAAAAAAAAAAALLS/QICAgEBAf///wAAAGS1/P///////wAAAP///xyS+gAAAN3q/pWbof///6Gqs////wAAAAAAACCV+v///zef+5LL/Xq2+woKCkVJTZWdppefqAIDAv///////////5WdpqvX/Z/R/Vyx/KDS/Zyjq5mhqpefqP///2ltcGdtczub+pafqP///0VJTY2hp5WdpgAAAGdtc////0Gk+3e//P///////yDIrvBnZ////8zQ1P////////b39P///6Kqsv///////5WdppefqP////T18pWdppWdpiDIrubw/gICAvb39P///yDIriaX+pWdpUan+5rP/R4eHr2+u////////////5Wdpv///////5WdpuHi3/Lz8Git+8nf/Wdtc/////////Dx7v///9LS0JWdpiDIrvBnZ/BnZ77Z/ZWdppWdppWdpuDh3uzt6q6vrZWdpmdtc+rr6dPU0cvLydbX1JWdpkVJTZnF/O71/vf6//BnZ2dtc////////9LT0Ovs6ru8uZWdppWdppWdpjM0M5WdppWdppWdplSl+/BnZ+bn5O7v7AMDA6Gqs2dtc////77g/v///6TT/bfc/Vau+3vA/P///////4TE/P///////////6bU/f///////7W2szIzMozI/P///2y5/P///y6b+pWdpoq+/KbM/JWdpv///////////yDIriDIrqGqs2dtc6Gqs6Gqs6Gqs////2dtc0VJTZWdpmdtc////x0dHZWdptPl/kVJTSDIriDIrmdtc6iopsDBvvX282FmaWdtc5Wdpv///yDIriDIrvBnZ2dtc6Gqs6Gqs6Gqs2dtc2dtc2dtc2dtc/BnZ35+ffBnZ0VJTWdtc2dtc2dtc35+ff///2dtc9/g3oOKkp6nsL3CyP7//v///6Gqs/f49fBnZyDIrmdtc0VJTdgAqpkAAAD5dFJOUwDMDxgGBArMAQIMDhYDB5kFEwkVHeUfHHgU2tgZEafMIvJD5Oc+GxrNk9Ll2SZF6wge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") 0 -26px;
  background-size: 34px 471px
}

.container-default .slide-verify-slider-mask-item {
  height: 38px;
  /*top: -1px;*/
  border: 1px solid #ffffff;
}

.container-active .slide-verify-slider-mask-item {
  height: 38px;
  top: -1px;
  border: 1px solid #1991FA;
}

.container-active .slide-verify-slider-mask {
  height: 38px;
  border-width: 1px;
}

.container-success .slide-verify-slider-mask-item {
  height: 38px;
  top: -1px;
  border: 1px solid #52CCBA;
  background-color: #52CCBA !important;
}

.container-success .slide-verify-slider-mask {
  height: 38px;
  border: 1px solid #52CCBA;
  background-color: #D2F4EF;
}

.container-success .slide-verify-slider-mask-item-icon {
  background-position: 0 0 !important;
}

.container-fail .slide-verify-slider-mask-item {
  height: 38px;
  top: -1px;
  border: 1px solid #f57a7a;
  background-color: #f57a7a !important;
}

.container-fail .slide-verify-slider-mask {
  height: 38px;
  border: 1px solid #f57a7a;
  background-color: #fce1e1;
}

.container-fail .slide-verify-slider-mask-item-icon {
  background-position: 0 -82px !important;
}

.container-active .slide-verify-slider-text,
.container-success .slide-verify-slider-text,
.container-fail .slide-verify-slider-text {
  display: none;
}

.slide-verify-slider-text {
  background: -webkit-gradient(linear, left top, right top, color-stop(0, #4d4d4d), color-stop(.4, #4d4d4d), color-stop(.5, #fff), color-stop(.6, #4d4d4d), color-stop(1, #4d4d4d));
  -webkit-background-clip: text;
  -webkit-animation: slidetounlock 3s infinite;
  -webkit-text-size-adjust: none;
}

@-webkit-keyframes slide-verify-slider-text {
  0% {
    background-position: -200px 0
  }
  100% {
    background-position: 200px 0
  }
}

</style>
