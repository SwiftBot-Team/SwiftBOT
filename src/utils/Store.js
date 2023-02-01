module.exports = (t) => [
  {
    title: t('commands:loja:itens:stampOne.title'),
    description: t('commands:loja:itens:stampOne.description'),
    amount: 5000,
    buy: async (user, database) => {
      await database.ref(`SwiftBOT/users/${user}/stamp`).set(1)
    },
    id: 1,
    img: 'https://imgur.com/YnrbAgS.png'
  },
  {
    title: t('commands:loja:itens:stampTwo.title'),
    description: t('commands:loja:itens:stampTwo.description'),
    amount: 10000,
    buy: async (user, database) => {
      await database.ref(`SwiftBOT/users/${user}/stamp`).set(2)
    },
    id: 2,
    img: 'https://imgur.com/vMhDMIb.png'
  },
  {
    title: t('commands:loja:itens:stampThree.title'),
    description: t('commands:loja:itens:stampThree.description'),
    amount: 30000,
    buy: async (user, database) => {
      await database.ref(`SwiftBOT/users/${user}/stamp`).set(3)
    },
    id: 3,
    img: 'https://imgur.com/MgW7IxL.png'
  },
  {
    title: t('commands:loja:itens:stampFour.title'),
    description: t('commands:loja:itens:stampFour.description'),
    amount: 50000,
    buy: async (user, database) => {
      await database.ref(`SwiftBOT/users/${user}/stamp`).set(4)
    },
    id: 4,
    img: 'https://imgur.com/IyF6PxG.png'
  }
]