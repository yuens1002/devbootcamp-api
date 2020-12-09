const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Please add a course description'],
  },
  weeks: {
    type: Number,
    required: [true, 'Please add a course duration in weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a course tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
});

CourseSchema.statics.getAvgCost = async function (bootcampId) {
  console.log(' Calculating avg cost... '.blue.inverse);
  // aggregate returns a promise hence await
  const obj = await this.aggregate([
    {
      // matching using the property name and the identifier being passed in
      // get a hold of all the bootcamps with the same ID
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        // apply the property to all bootcamps with the id
        _id: '$bootcamp',
        // give it a property and use the $avg function to avg the 'tuition from the model
        avgCost: { $avg: '$tuition' },
      },
    },
  ]);

  try {
    if (obj[0]) {
      // add avgCost to the bootcamp
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        avgCost: Math.ceil(obj[0].avgCost / 10) * 10,
      });
    } else {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        avgCost: undefined,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
CourseSchema.post('save', async function () {
  // console.log('save from courseSchema');
  // this.bootcamp is referring to the property
  // referring to the id of the bootcamp
  await this.constructor.getAvgCost(this.bootcamp);
});

// call getAverageCost before remove
CourseSchema.post('remove', async function () {
  // console.log('remove from courseSchema');
  await this.constructor.getAvgCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
