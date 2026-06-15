const { withEntitlementsPlist, withInfoPlist } = require("@expo/config-plugins");

const withBadgeOnlyNotifications = (config) => {
  config = withEntitlementsPlist(config, (pluginConfig) => {
    delete pluginConfig.modResults["aps-environment"];
    return pluginConfig;
  });

  config = withInfoPlist(config, (pluginConfig) => {
    const backgroundModes = pluginConfig.modResults.UIBackgroundModes;
    if (Array.isArray(backgroundModes)) {
      pluginConfig.modResults.UIBackgroundModes = backgroundModes.filter(
        (mode) => mode !== "remote-notification",
      );
    }
    return pluginConfig;
  });

  return config;
};

module.exports = withBadgeOnlyNotifications;
