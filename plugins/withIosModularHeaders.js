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
        if (podfile.includes("prepare_react_native_project!")) {
          podfile = podfile.replace(
            "prepare_react_native_project!",
            `${MODULAR_HEADERS_LINE}\n\nprepare_react_native_project!`,
          );
        } else {
          podfile = `${MODULAR_HEADERS_LINE}\n\n${podfile}`;
        }
      }

      fs.writeFileSync(podfilePath, podfile);

      return config;
    },
  ]);

module.exports = withIosModularHeaders;
