var synaptic = require('synaptic') // this line is not needed in the browser
var csv = require('fast-csv')
var fs = require('fs')
var Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect
var Promise = require('bluebird')


function toVector(num) {
  var v = [0,0,0,0]
  v[num-1] = 0.8
  return v
}

function normalize(row) {
  return toVector(row[1]) //season
  .concat([
    parseInt(row[2])*0.8, // holiday
    parseInt(row[3])*0.8, // workingday
  ]).concat(toVector(row[4])) // weather 
  .concat([
    row[5] / 50, // temperature
    row[6] / 100, // humidity
    row[7] / 100, // windspeed
    parseInt(row[10] || -1)  // count
  ])
}

function read(filename) {
  var data = []
  var stream = fs.createReadStream(filename)
  return new Promise((resolve, reject) => {
    var csvStream = csv()
      .on('data', row => data.push(row))
      .on('end', () => {resolve(data)})
    stream.pipe(csvStream)
  })
}

var network = new synaptic.Architect.Perceptron(13, 25, 1);
var learningRate = .3;

read('data/original/all.csv')
  .then(data => data.map(normalize))
  .then(data => {
    return data
      .filter(row => row[13] >= 0)
      .map(row => {
        return {
          output: row[13],
          input: row.splice(0, 12),
        }
      })
  }).then(data => {
    var trainer = new Trainer(network);
    trainer.train(data);
    console.log(data)
  })


