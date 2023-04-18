// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DAN',
  tagline: 'DAN are cool',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://opendan.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'opendan.ai', // Usually your GitHub org/user name.
  projectName: 'DAN', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          docLayoutComponent: '@theme/DocPage',
          docItemComponent: '@theme/ApiItem', // Derived from docusaurus-theme-openapi-docs
        },

        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'apiDocs',
        docsPluginId: 'classic',
        config: {
          // petstore_versioned: {
          //   specPath: "openapi/petstore.yaml",
          //   outputDir: "api/petstore_versioned", // No trailing slash
          //   sidebarOptions: {
          //     groupPathsBy: "tag",
          //     categoryLinkSource: "tag",
          //   },
          //   version: "2.0.0", // Current version
          //   label: "v2.0.0", // Current version label
          //   baseUrl: "/petstore_versioned/swagger-petstore-yaml", // Leading slash is important
          //   versions: {
          //     "1.0.0": {
          //       specPath: "examples/petstore-1.0.0.yaml",
          //       outputDir: "api/petstore_versioned/1.0.0", // No trailing slash
          //       label: "v1.0.0",
          //       baseUrl: "/petstore_versioned/1.0.0/swagger-petstore-yaml", // Leading slash is important
          //     },
          //   },
          // },
          petstore: {
            specPath: 'openapi/dan.yaml',
            outputDir: 'docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
            //template: "api.mustache", // Customize API MDX with mustache template
            hideSendButton: true,
          },
          // cos: {
          //   specPath: "openapi/openapi-cos.json",
          //   outputDir: "api/cos",
          //   sidebarOptions: {
          //     groupPathsBy: "tag",
          //   },
          // },
          // burgers: {
          //   specPath: "openapi/food/burgers/openapi.yaml",
          //   outputDir: "api/food/burgers",
          // },
          // yogurt: {
          //   specPath: "openapi/food/yogurtstore/openapi.yaml",
          //   outputDir: "api/food/yogurtstore",
          // },
        },
      },
    ],
  ],
  themes: ['docusaurus-theme-openapi-docs'], // Allows use of @theme/ApiItem and other components

  stylesheets: [
    {
      href: 'https://use.fontawesome.com/releases/v5.11.0/css/all.css',
      type: 'text/css',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '',
        logo: {
          alt: 'DAN Logo',
          src: 'img/dan-logo.svg',
          href: '/docs/quick-start',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },

          {
            type: 'docSidebar',
            sidebarId: 'apiSidebar',
            position: 'left',
            label: 'API reference',
          },

          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/fiatrete/DAN-Stable-Diffusion-Computing-Network',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          // {
          //   title: 'Docs',
          //   items: [
          //     {
          //       label: 'Tutorial',
          //       to: '/docs/intro',
          //     },
          //   ],
          // },
          // {
          //   title: 'Community',
          //   items: [
          //     {
          //       label: 'Stack Overflow',
          //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          //     },
          //     {
          //       label: 'Discord',
          //       href: 'https://discordapp.com/invite/docusaurus',
          //     },
          //     {
          //       label: 'Twitter',
          //       href: 'https://twitter.com/docusaurus',
          //     },
          //   ],
          // },
          // {
          //   title: 'More',
          //   items: [
          //     {
          //       label: 'Blog',
          //       to: '/blog',
          //     },
          //     {
          //       label: 'GitHub',
          //       href: 'https://github.com/fiatrete/DAN-Stable-Diffusion-Computing-Network',
          //     },
          //   ],
          // },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} OpenDAN.ai. All rights reserved.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['ruby', 'csharp', 'php', 'java', 'powershell'],
      },

      languageTabs: [
        {
          highlight: 'bash',
          language: 'curl',
          logoClass: 'bash',
        },
        {
          highlight: 'python',
          language: 'python',
          logoClass: 'python',
          variant: 'requests',
        },
        {
          highlight: 'go',
          language: 'go',
          logoClass: 'go',
        },
        {
          highlight: 'javascript',
          language: 'nodejs',
          logoClass: 'nodejs',
          variant: 'axios',
        },
        {
          highlight: 'ruby',
          language: 'ruby',
          logoClass: 'ruby',
        },
        {
          highlight: 'csharp',
          language: 'csharp',
          logoClass: 'csharp',
          variant: 'httpclient',
        },
        {
          highlight: 'php',
          language: 'php',
          logoClass: 'php',
        },
        {
          highlight: 'java',
          language: 'java',
          logoClass: 'java',
          variant: 'unirest',
        },
        {
          highlight: 'powershell',
          language: 'powershell',
          logoClass: 'powershell',
        },
      ],
    }),
}

module.exports = config
