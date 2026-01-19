function makeName(index, quality) {
  return `Video_${index}_${quality}_${Date.now()}`;
}

module.exports = { makeName };

