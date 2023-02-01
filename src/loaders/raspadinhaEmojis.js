module.exports = new class raspadinhaEmojis {
    async load(client) {
        const porcentagem = {
            '709840578044493876': {
                porcentagem: 40,
                nome: '<:swiftcool:709840578044493876>',
                id: '709840578044493876',
                valor: 10
            },
            '709840578908651580': {
                porcentagem: 20,
                nome: '<:swiftworried:709840578908651580>',
                id: '709840578908651580',
                valor: 20
            },
            '709840579080486982': {
                porcentagem: 40,
                nome: '<:swiftlove:709840579080486982>',
                id: '709840579080486982',
                valor: 30
            }
        };

        const emojis = ['709840578044493876', '709840578908651580', '709840579080486982'];

        const array = [];

        for (let i = 0; i < emojis.length; i++) {
            for (let y = 0; y < porcentagem[emojis[i]].porcentagem; y++) {
                array.push(porcentagem[emojis[i]])
            }
        }

        function embaralhar(a) {
            let indice_atual = a.length, valor_temporario, indice_aleatorio;

            while (0 !== indice_atual) {
                indice_aleatorio = Math.floor(Math.random() * indice_atual);
                indice_atual -= 1;

                valor_temporario = a[indice_atual];
                a[indice_atual] = a[indice_aleatorio];
                a[indice_aleatorio] = valor_temporario;
            }

            return a;
        }

        return client.raspadinhaEmojis = embaralhar(array);
    }
}