import {Bar} from 'vue-chartjs'

export default Bar.extend({
  props: ['chartData', 'options'],
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
})