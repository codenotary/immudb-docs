// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/vsDark');


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'immudb Docs',
  tagline: 'Welcome to the immudb documentation. Great to see you here!',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://docs.immudb.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
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
          routeBasePath: '/',
          path: 'master',
          sidebarPath: require.resolve('./sidebars.js'),
        },

        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Force default theme light
      colorMode: {
        respectPrefersColorScheme: true,
      },

      navbar: {

        logo: {
          alt: 'immudb Logo White',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://hub.docker.com/r/codenotary',
            position: 'right',
            label: '🎉 20M pulls from docker hub!',
          },
          {
            type: 'html',
            position: 'right',
            value: '<iframe class="githubStars" src="https://ghbtns.com/github-btn.html?user=codenotary&repo=immudb&type=watch&count=true&size=small" frameborder="0" scrolling="0" width="140" height="20" title="GitHub"></iframe>',
          },
        ],
      },
      footer: {
        style: 'light',

        links: [
          { 
            items: [
            {
              html: `
              <div>
              <a href="/">
              <img src="/img/logo.svg" alt="immudb Website" width="120" />
              </a>
              <p>
              Open Source Immutable Database
              </p>
              <p>
              A unit of Codenotary Inc 
              </p>
              </div>
              `,
            },
            {
              html: `
              <div>
              <a href="https://twitter.com/immudb" target="_blank">
              <img src="/img/social/twitter.svg" alt="immudb Twitter" width="32" height="32" />
              </a>

              <a href="https://github.com/codenotary/immudb" target="_blank">
              <img src="/img/social/github.svg" alt="immudb Github" width="32" height="32" />
              </a>
              </div>
            `
            },
          ],
          },
          {
            title: 'Open Source',
            items: [
              {
                label: 'immudb',
                href: 'https://immudb.io',
              },
            ],
          },
          {
            title: 'Company',
            items: [
              {
                label: 'Codenotary',
                href: 'https://codenotary.com',
              },
              {
                label: 'Contact',
                href: 'https://codenotary.com/contact-us',
              },
            ],
          },
          {
            title: 'Useful Links',
            items: [
              {
                label: 'Privacy Policy',
                href: '/privacy-policy',
              },
              {
                label: 'Terms of Service',
                href: '/terms-of-use',
              },
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} by immudb. All rights reserved`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,

        additionalLanguages: ['csharp', 'java','bash'],
      },
    }),
};

module.exports = config;
