const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const MODULAR_HEADERS_LINE = "use_modular_headers!";

const withIosModularHeaders = (config) =>
  withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      let podfile = fs.readFileSync(podfilePath, "utf8");

      if (!podfile.includes(MODULAR_HEADERS_LINE)) {
        podfile = podfile.replace(
          /(platform :ios, min_ios_version_supported\s*)/,
          `$1\n${MODULAR_HEADERS_LINE}\n`,
        );
      }

      fs.writeFileSync(podfilePath, podfile);

      return config;
    },
  ]);

module.exports = withIosModularHeaders;
