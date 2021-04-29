

let app = Vue.createApp({
    data() {
      return {
        name: 'synne'
    }
  },
  methods: {
    aboutme() {
        console.log('hei' + name)
      }
    }
  });