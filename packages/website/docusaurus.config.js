module.exports = {
  title: 'overreact',
  tagline: 'A universal data layer for React',
  url: 'https://zlike.github.io',
  baseUrl: '/overreact-website/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'zlike',
  projectName: 'overreact-website', 
  themes: ['@docusaurus/theme-live-codeblock'],
  themeConfig: {
    hideableSidebar: true,
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
    navbar: {
      hideOnScroll: true,
      title: 'overreact',
      logo: {
        alt: 'overreact - A unversal data layer for React',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://dev.azure.com/msasg/Bing_Ads/_git/AdsAppsCampaignUI?path=%2Fprivate%2Fclient-data%2Fpackages%2Foverreact',
          label: 'Azure Repo',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'Concept',
              to: 'concept/spec',
            },
            {
              label: 'API Reference',
              to: 'api/data_fetcher',
            },
            {
              label: 'Recipes',
              to: 'recipes/custom_data_hook',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Microsoft.`,
    },
    gtag: {
      trackingID: 'G-0CFVJYKBJ8',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/zlike/overreact-website/edit/master/website/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/zlike/overreact-website/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
