import router from './router'

Vue.config.productionTip = false

new Vue({
  // public/index.htmlの"<div id=app></div>"の箇所にレンダリング
  el: '#app',
  router
})

