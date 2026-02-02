const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const config = require('../config');
const hexoService = require('./hexo');

const configPath = path.resolve(__dirname, '..', config.blogRoot, '_config.yml');

module.exports = {
  get: async () => {
    try {
      if (!fs.existsSync(configPath)) {
        throw new Error('Config file not found');
      }
      const fileContent = fs.readFileSync(configPath, 'utf8');
      const parsedConfig = yaml.load(fileContent);
      return {
        content: parsedConfig,
        raw: fileContent
      };
    } catch (error) {
      throw error;
    }
  },

  update: async (data) => {
    try {
      if (!fs.existsSync(configPath)) {
        throw new Error('Config file not found');
      }

      // We expect data to be the object to dump to YAML
      // Alternatively, we could accept raw string if we want a raw editor
      // For safety and valid YAML, let's try to use the object if provided, or parse raw if provided

      let newContent;
      if (data.raw) {
        newContent = data.raw;
        // Validate YAML
        yaml.load(newContent);
      } else {
        newContent = yaml.dump(data.content);
      }

      fs.writeFileSync(configPath, newContent, 'utf8');

      // Trigger generate to apply changes
      hexoService.generate().catch(console.error);

      return { message: 'Config updated' };
    } catch (error) {
      throw error;
    }
  }
};
