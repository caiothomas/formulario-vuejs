import {Pie, mixins} from 'vue-chartjs'
const { reactiveProp } = mixins

export default Pie.extend({
  props: ['chartData', 'options'],
  mixins: [reactiveProp],  
  mounted () {
    this.renderChart(this.chartData, this.options)
  }  
})