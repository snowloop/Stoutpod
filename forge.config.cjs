// CommonJS because package.json sets "type": "module".
const shipped = ["/dist", "/package.json"];

module.exports = {
  packagerConfig: {
    name: "Stoutpod",
    appBundleId: "com.snowloop.stoutpod",
    appCategoryType: "public.app-category.music",
    // Extension is omitted; the packager appends .icns on macOS.
    icon: "build/icon",
    asar: true,
    // Vite already bundled every dependency, so ship only the build output.
    ignore: (path) =>
      path !== "" &&
      !shipped.some((entry) => path === entry || path.startsWith(`${entry}/`)),
  },
  makers: [
    // Homebrew downloads this archive.
    { name: "@electron-forge/maker-zip", platforms: ["darwin"], config: {} },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: { owner: "snowloop", name: "Stoutpod" },
        prerelease: false,
        // Forge reads the token from the GITHUB_TOKEN environment variable.
        draft: true,
      },
    },
  ],
};
