import moment = require('moment');

export const habrMockParsed = [
  {
    title:
      'PVS-Studio Static Analyzer as a Tool for Protection against Zero-Day Vulnerabilities',
    time: `${moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD')} 07:17:00`,
    tags: ['PVS-Studio corporate blog', 'Information Security'],
    imageLink:
      'https://habrastorage.org/webt/wn/yg/mo/wnygmobm1xqfcuxn4cmsqzay8lg.png',
    link: 'https://habr.com/en/company/pvs-studio/blog/477838/',
    totalViews: 190,
    totalVotes: 27,
    rawTime: 'yesterday at 10:17 AM',
    externalID: '477838',
  },
  {
    title: 'Checking the Ark Compiler Recently Made Open-Source by Huawei',
    time: '2019-12-02 06:39:00',
    tags: ['PVS-Studio corporate blog', 'Open source', 'C++', 'Compilers', 'C'],
    imageLink:
      'https://habrastorage.org/getpro/habr/post_images/e03/5c8/f22/e035c8f22108a3bbe00865f9307244fe.png',
    link: 'https://habr.com/en/company/pvs-studio/blog/478282/',
    totalViews: 329,
    totalVotes: 24,
    rawTime: 'December 2, 2019 at 09:39 AM',
    externalID: '478282',
  },
  {
    title: 'СodeSide. The new game for Russian AI Cup',
    time: '2019-12-02 16:31:00',
    tags: [
      'Mail.ru Group corporate blog',
      'Abnormal programming',
      'Sport programming',
      'Entertaining tasks',
      'Artificial Intelligence',
    ],
    imageLink:
      'https://habrastorage.org/webt/tw/r9/w5/twr9w5yd649q0nvqdja9fxnftbw.jpeg',
    link: 'https://habr.com/en/company/mailru/blog/478400/',
    totalVotes: 5,
    totalViews: 383,
    rawTime: 'December 2, 2019 at 07:31 PM',
    externalID: '478400',
  },
  {
    title: 'Windows Terminal Preview v0.7 Release',
    time: `${moment().format('YYYY-MM-DD')} 07:00:00`,
    tags: [
      'Microsoft corporate blog',
      'System administration',
      'GitHub',
      'Development for Windows',
    ],
    imageLink:
      'https://habrastorage.org/getpro/habr/post_images/8fd/846/426/8fd8464262f2a92659d4f2acb085a840.gif',
    link: 'https://habr.com/en/company/microsoft/blog/478166/',
    totalViews: 218,
    totalVotes: 2,
    rawTime: 'today at 10:00 AM',
    externalID: '478166',
  },
  {
    title: 'AI-assisted IntelliSense for your team’s codebase',
    time: '2019-11-29 07:00:00',
    tags: [
      'Microsoft corporate blog',
      'Programming',
      'Visual Studio',
      'Machine learning',
      'Artificial Intelligence',
    ],
    imageLink:
      'https://habrastorage.org/webt/jo/zt/kk/joztkkbm3d1zf17-0q7n10xjrzk.jpeg',
    link: 'https://habr.com/en/company/microsoft/blog/477104/',
    totalViews: 441,
    totalVotes: 2,
    rawTime: 'November 29, 2019 at 10:00 AM',
    externalID: '477104',
  },
  {
    title:
      'Dynamic CDN for Low Latency WebRTC Streaming with Stream Access Control',
    time: '2019-12-02 09:19:00',
    tags: [
      'Flashphoner corporate blog',
      'Website development',
      'Working with video',
      'Programming',
      'Video conferencing',
    ],
    imageLink:
      'https://habrastorage.org/webt/zo/-h/xu/zo-hxunxkji95ubq9vioprymxqm.png',
    link: 'https://habr.com/en/company/flashphoner/blog/478310/',
    totalVotes: 1,
    totalViews: 158,
    rawTime: 'December 2, 2019 at 12:19 PM',
    externalID: '478310',
  },
];
