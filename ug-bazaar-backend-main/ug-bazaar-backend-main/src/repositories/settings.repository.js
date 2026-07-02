const { Settings } = require('../models/other.models');

class SettingsRepository {
  async getSettings() {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return settings;
  }

  async updateSettings(data) {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(data);
    } else {
      Object.assign(settings, data);
    }
    return settings.save();
  }
}

module.exports = new SettingsRepository();
